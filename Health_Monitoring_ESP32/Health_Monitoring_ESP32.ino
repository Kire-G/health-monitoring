#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include "DHT.h"

#define DHTTYPE DHT11
#define DHTPIN 32
#define DS18B20 15
#define REPORTING_PERIOD_MS 1000  // sensor print interval
#define HTTP_SEND_PERIOD_MS 1000  // HTTP POST interval
#define NO_BEAT_TIMEOUT_MS 10000  // 10 seconds no beat timeout

const char* serverUrl = "http://192.168.0.106:8080/data";
const char* ssid = "Georgievi";
const char* password = "1236547890";

float temperature = NAN, humidity = NAN, BPM = 0, SpO2 = 0, bodytemperatureC = NAN;

DHT dht(DHTPIN, DHTTYPE);
PulseOximeter pox;
OneWire oneWire(DS18B20);
DallasTemperature sensors(&oneWire);

TaskHandle_t httpTaskHandle = NULL;

volatile uint32_t lastBeatTime = 0;  // updated in ISR callback

void IRAM_ATTR onBeatDetected() {
  lastBeatTime = millis();
  Serial.println("Beat detected!");
}

void setup() {
  Serial.begin(115200);
  pinMode(38, OUTPUT);

  sensors.begin();
  sensors.setResolution(12);

  dht.begin();
  delay(500);

  Serial.print("Initializing pulse oximeter....");
  if (!pox.begin()) {
    Serial.println("FAILED");
    while (true);  // halt
  } else {
    Serial.println("SUCCESS");
    pox.setOnBeatDetectedCallback(onBeatDetected);
  }
  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    pox.update();  // keep sensor alive during WiFi connect
    delay(10);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? "\nWiFi connected!" : "\nFailed to connect WiFi");

  xTaskCreatePinnedToCore(
    httpTask,
    "HTTP Task",
    8192,
    NULL,
    1,
    &httpTaskHandle,
    1
  );
}

void loop() {
  pox.update();

  // Reset sensor if no beat detected for X seconds
  if (millis() - lastBeatTime > NO_BEAT_TIMEOUT_MS) {
    Serial.println("No beat detected for 10s - resetting sensor");
    pox.shutdown();
    delay(1000);
    pox.resume();
    lastBeatTime = millis();  // prevent repeated resets
  }

  // Read sensors
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;

  sensors.setWaitForConversion(false);
  sensors.requestTemperatures();
  sensors.setWaitForConversion(true);
  bodytemperatureC = sensors.getTempCByIndex(0);

  BPM = pox.getHeartRate();
  SpO2 = pox.getSpO2();

  static uint32_t lastPrint = 0;
  if (millis() - lastPrint > REPORTING_PERIOD_MS) {
    Serial.printf("Temp: %.1f C, Humidity: %.1f %%, BPM: %.1f, SpO2: %.1f, BodyTemp: %.1f C\n",
                  temperature, humidity, BPM, SpO2, bodytemperatureC);
    lastPrint = millis();
  }

  delay(10); // small delay, keep loop responsive
}

void httpTask(void *pvParameters) {
  while (true) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      String json = "{";
      json += "\"temperature\":" + String(temperature, 1) + ",";
      json += "\"humidity\":" + String(humidity, 1) + ",";
      json += "\"bodyTemperature\":" + String(bodytemperatureC, 1) + ",";
      json += "\"bpm\":" + String(BPM, 1) + ",";
      json += "\"spo2\":" + String(SpO2, 1);
      json += "}";

      int httpResponseCode = http.POST(json);

      if (httpResponseCode > 0) {
        Serial.printf("HTTP Response code: %d\n", httpResponseCode);
      } else {
        Serial.println("HTTP POST Error");
      }
      http.end();
    } else {
      Serial.println("WiFi not connected");
    }

    vTaskDelay(HTTP_SEND_PERIOD_MS / portTICK_PERIOD_MS);
  }
}
