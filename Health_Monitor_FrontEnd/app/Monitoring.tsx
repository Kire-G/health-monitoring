import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

const { width, height } = Dimensions.get("window");

export default function Monitoring() {
  const [healthData, setHealthData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<SensorData[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [warning, setWarning] = useState("");

  const fetchTimer = useRef<NodeJS.Timeout | null>(null);
  const measureTimer = useRef<NodeJS.Timeout | null>(null);

  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      fetchTimer.current && clearInterval(fetchTimer.current);
      measureTimer.current && clearInterval(measureTimer.current);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<SensorData>(`${baseURL}/data`);
      setHealthData(data);
      setRecords((prev) => [...prev, data]);
      if (measuring && data.bpm === 0) {
        setWarning("⚠️ Please place your finger on the sensor.");
      } else {
        setWarning("");
      }
    } catch {
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  const startMeasure = () => {
    setWarning("");
    setMeasuring(true);
    setElapsed(0);
    setRecords([]);
    setShowSummary(false);
    fetchData();
    animatePulse();
    fetchTimer.current = setInterval(fetchData, 1000);
    measureTimer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const stopMeasure = () => {
    setMeasuring(false);
    wave1.stopAnimation();
    wave2.stopAnimation();
    wave1.setValue(0);
    wave2.setValue(0);
    fetchTimer.current && clearInterval(fetchTimer.current);
    measureTimer.current && clearInterval(measureTimer.current);
    setHealthData(null);

    // Check if we have any record with bpm > 0 to show summary or warning
    const validRecords = records.filter((r) => r.bpm > 0);
    if (validRecords.length > 0) {
      setShowSummary(true);
      setWarning("");
    } else {
      setShowSummary(false);
      setWarning("⚠️ No valid measurement collected. Please try again.");
    }
  };

  const animatePulse = () => {
    Animated.loop(
      Animated.timing(wave1, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      })
    ).start();
    setTimeout(() => {
      Animated.loop(
        Animated.timing(wave2, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ).start();
    }, 900);
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
    temperature: { min: 20, max: 25 },
    humidity: { min: 30, max: 60 },
    bodyTemperature: { min: 36.1, max: 37.2 },
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
            val={healthData?.bpm}
            unit="bpm"
            loading={loading && measuring}
          />
          <Vital
            icon={
              <MaterialCommunityIcons name="lungs" size={48} color="#50E3C2" />
            }
            label="O₂"
            val={healthData?.spo2}
            unit="%"
            loading={loading && measuring}
          />
          <Vital
            icon={<MaterialIcons name="thermostat" size={48} color="#F5A623" />}
            label="Temp"
            val={healthData?.temperature}
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
            val={healthData?.humidity}
            unit="%"
            loading={loading && measuring}
          />
          <Vital
            icon={
              <MaterialIcons name="thermostat-auto" size={48} color="#9B59B6" />
            }
            label="Room Temp"
            val={healthData?.bodyTemperature}
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

      {measuring && (
        <View style={styles.pulse}>
          {[wave1, wave2].map((wv, i) => (
            <Animated.View
              key={i}
              style={[
                styles.ripple,
                {
                  transform: [
                    {
                      scale: wv.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 3],
                      }),
                    },
                  ],
                  opacity: wv.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 0],
                  }),
                },
              ]}
            />
          ))}
        </View>
      )}

      {measuring && <Text style={styles.timer}>⏱ Measuring: {elapsed}s</Text>}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.button, measuring && { backgroundColor: "#444" }]}
          onPressIn={startMeasure}
          onPressOut={stopMeasure}
        >
          <Text style={styles.buttonText}>
            {measuring ? "Measuring…" : "Hold to Measure"}
          </Text>
        </TouchableOpacity>
      </View>
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
  pulse: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  ripple: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "#4A90E2",
  },
  timer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
