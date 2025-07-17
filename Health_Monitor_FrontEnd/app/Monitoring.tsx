import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { baseURL } from "@/config/axiosConfig";
import SensorData from "@/constants/SensorData";
import { useAppContext } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");

export default function Monitoring() {
  const [healthData, setHealthData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [measuring, setMeasuring] = useState(true); // starts measuring immediately
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<SensorData[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const { user } = useAppContext();
  const [warning, setWarning] = useState("");
  const validStarted = useRef(false);
  const recordsRef = useRef(records);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  const fetchTimer = useRef<NodeJS.Timeout | null>(null);
  const measureTimer = useRef<NodeJS.Timeout | null>(null);

  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTimer.current = setInterval(() => {
      fetchData();
    }, 1000);

    return () => {
      fetchTimer.current && clearInterval(fetchTimer.current);
      measureTimer.current && clearInterval(measureTimer.current);
      wave1.stopAnimation();
      wave2.stopAnimation();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<SensorData>(`${baseURL}/data`);
      setHealthData(data);

      if (measuring) {
        if (data.bpm > 0) {
          setWarning("");

          if (!validStarted.current) {
            validStarted.current = true;
            animatePulse();

            let seconds = 0;
            measureTimer.current = setInterval(() => {
              seconds++;
              setElapsed(seconds);

              if (seconds >= 10) {
                stopMeasure(recordsRef.current);
              }
            }, 1000);
          }

          setRecords((prev) => [...prev, data]);
        } else {
          if (!validStarted.current) {
            setWarning("⚠️ Please place your finger on the sensor.");
          }
        }
      }
    } catch (error) {
      console.error(error);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  const stopMeasure = async (finalRecords: SensorData[]) => {
    setMeasuring(false);
    fetchTimer.current && clearInterval(fetchTimer.current);
    measureTimer.current && clearInterval(measureTimer.current);
    wave1.stopAnimation();
    wave2.stopAnimation();
    wave1.setValue(0);
    wave2.setValue(0);

    const validRecords = finalRecords.filter((r) => r.bpm > 0);
    if (validRecords.length > 0) {
      setShowSummary(true);
      setWarning("");

      const calculateAverage = (
        records: SensorData[],
        key: keyof SensorData
      ) => {
        if (records.length === 0) return 0;
        const sum = records.reduce((s, v) => s + (v[key] ?? 0), 0);
        const avg = sum / records.length;
        if (key === "bpm" || key === "spo2") {
          return Math.round(avg);
        }
        return parseFloat(avg.toFixed(1));
      };

      const measurementData = {
        userEmail: user.email,
        heartRate: calculateAverage(validRecords, "bpm"),
        oxygen: calculateAverage(validRecords, "spo2"),
        temperature: calculateAverage(validRecords, "temperature"),
        humidity: calculateAverage(validRecords, "humidity"),
        roomTemperature: calculateAverage(validRecords, "bodyTemperature"),
      };

      try {
        await axios.post(`${baseURL}/measurements/`, measurementData);
        console.log("Average measurements saved successfully!");
      } catch (error) {
        console.error("Failed to save measurements:", error);
        setWarning("⚠️ Could not save measurements to the server.");
      }
    } else {
      setShowSummary(false);
      setWarning("⚠️ No valid vitals captured. Please try again.");
    }
  };

  const animatePulse = () => {
    const createAnimation = (wave: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.spring(wave, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.spring(wave, {
            toValue: 0,
            friction: 4,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createAnimation(wave1).start();
    setTimeout(() => {
      createAnimation(wave2).start();
    }, 1000);
  };

  const avg = (key: keyof SensorData) => {
    const validRecords = records.filter((r) => r.bpm > 0);
    if (validRecords.length === 0) return NaN;
    const sum = validRecords.reduce((s, v) => s + (v[key] ?? 0), 0);
    return parseFloat((sum / validRecords.length).toFixed(1));
  };

  const ranges: Record<string, { min: number; max: number }> = {
    bpm: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
    temperature: { min: 36.1, max: 37.2 },
    humidity: { min: 30, max: 60 },
    bodyTemperature: { min: 20, max: 25 },
  };

  const getBarColor = (key: string, val: number): string => {
    const r = ranges[key];
    if (!r) return "#50E3C2";
    const threshold = (r.max - r.min) * 0.2;
    if (val < r.min - threshold || val > r.max + threshold) return "#D9534F";
    if (val < r.min || val > r.max) return "#F0AD4E";
    return "#5CB85C";
  };

  const getAdvice = () => {
    const adv: string[] = [];
    const validRecords = records.filter((r) => r.bpm > 0);
    if (validRecords.length === 0) return adv;

    Object.entries(ranges).forEach(([k, r]) => {
      const v = avg(k as keyof SensorData);
      if (isNaN(v)) return;

      if (k === "bodyTemperature") {
        if (v < r.min)
          adv.push(
            `❄️ Room Temperature is low (${v}°C). Consider warming up the room.`
          );
        else if (v > r.max)
          adv.push(
            `🔥 Room Temperature is high (${v}°C). Consider cooling the room.`
          );
      } else if (k === "temperature") {
        if (v < r.min)
          adv.push(
            `⬇️ Body Temperature is low (${v}°C). Consider consulting a doctor.`
          );
        else if (v > r.max)
          adv.push(
            `⬆️ Body Temperature is high (${v}°C). You might have a fever.`
          );
      } else {
        if (v < r.min) adv.push(`⬇️ ${k.toUpperCase()} is low (${v}).`);
        else if (v > r.max) adv.push(`⬆️ ${k.toUpperCase()} is high (${v}).`);
      }
    });

    if (adv.length === 0) adv.push("✅ All vitals are in healthy range.");
    return adv;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stats}>
          <Vital
            icon={<FontAwesome5 name="heartbeat" size={48} color="#dc143c" />}
            label="Heart"
            val={healthData?.bpm > 0 ? healthData.bpm : null}
            unit="bpm"
            loading={loading && measuring}
          />
          <Vital
            icon={
              <MaterialCommunityIcons name="lungs" size={48} color="#50E3C2" />
            }
            label="O₂"
            val={healthData?.bpm > 0 ? healthData.spo2 : null}
            unit="%"
            loading={loading && measuring}
          />
          <Vital
            icon={<MaterialIcons name="thermostat" size={48} color="#F5A623" />}
            label="Body Temp"
            val={healthData?.bpm > 0 ? healthData.temperature : null}
            unit="°C"
            loading={loading && measuring}
          />
          <Vital
            icon={
              <MaterialCommunityIcons
                name="water-percent"
                size={48}
                color="#4A90E2"
              />
            }
            label="Humidity"
            val={healthData?.bpm > 0 ? healthData.humidity : null}
            unit="%"
            loading={loading && measuring}
          />
          <Vital
            icon={
              <MaterialIcons name="thermostat-auto" size={48} color="#9B59B6" />
            }
            label="Room Temp"
            val={healthData?.bpm > 0 ? healthData.bodyTemperature : null}
            unit="°C"
            loading={loading && measuring}
          />
        </View>

        {!!warning && (
          <Text style={[styles.warning, { marginBottom: 20 }]}>{warning}</Text>
        )}

        {showSummary && (
          <>
            <View style={styles.summary}>
              <Text style={styles.header}>📊 Averages</Text>
              {Object.keys(ranges).map((k) => {
                const val = avg(k as keyof SensorData);
                return (
                  <View key={k} style={styles.barRow}>
                    <Text style={styles.barLabel}>{k.toUpperCase()}</Text>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFg,
                          {
                            width: `${Math.min(100, val)}%`,
                            backgroundColor: getBarColor(k, val),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barVal}>{isNaN(val) ? "--" : val}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.advice}>
              <Text style={styles.header}>💡 Advice</Text>
              {getAdvice().map((a, i) => (
                <Text key={i} style={styles.adviceText}>
                  {a}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {measuring && validStarted.current && (
        <View style={styles.pulseContainer}>
          {[wave1, wave2].map((wave, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pulse,
                {
                  transform: [
                    {
                      scale: wave.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.4],
                      }),
                    },
                  ],
                  opacity: wave.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 0],
                  }),
                },
              ]}
            >
              <FontAwesome5 name="heart" size={100} color="#dc143c" />
            </Animated.View>
          ))}
        </View>
      )}

      {measuring && validStarted.current && (
        <Text style={styles.timer}>⏱ Measuring: {elapsed}s</Text>
      )}
    </View>
  );
}

const Vital = ({ icon, label, val, unit, loading }: any) => (
  <View style={styles.row}>
    {icon}
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : val != null ? (
        `${val.toFixed(1)} ${unit}`
      ) : (
        "--"
      )}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1f1f3f" },
  content: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  stats: { marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  label: { flex: 1, marginLeft: 20, color: "#bbb", fontSize: 18 },
  value: { fontWeight: "bold", fontSize: 18, color: "#fff" },
  warning: { color: "#F5A623", textAlign: "center", fontSize: 16 },
  summary: { marginTop: 30 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#fff" },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  barLabel: { width: 110, color: "#bbb", fontWeight: "bold", fontSize: 16 },
  barBg: {
    flex: 1,
    height: 15,
    backgroundColor: "#333",
    borderRadius: 6,
    marginHorizontal: 10,
  },
  barFg: {
    height: 15,
    borderRadius: 6,
  },
  barVal: { width: 40, color: "#ddd", fontWeight: "600" },
  advice: {
    marginTop: 40,
    paddingHorizontal: 5,
  },
  adviceText: {
    fontSize: 18,
    color: "#aaf",
    marginBottom: 12,
  },
  pulseContainer: {
    position: "absolute",
    top: height * 0.65,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});
