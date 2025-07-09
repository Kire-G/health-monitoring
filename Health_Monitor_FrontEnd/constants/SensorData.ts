export default interface SensorData {
  bpm: number; // heart rate
  spo2: number; // oxygen saturation
  humidity: number;
  bodyTemperature: number; // body temperature
  temperature: number; // room temperature or environmental temp?
}
