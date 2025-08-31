import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { baseURL } from "@/config/axiosConfig";
import SensorData from "@/constants/SensorData";
import { useAppContext } from "@/context/AppContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function Monitoring() {
  const [healthData, setHealthData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [measuring, setMeasuring] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<SensorData[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const { user } = useAppContext();
  const [warning, setWarning] = useState("");
  const validStarted = useRef(false);
  const [lastStable, setLastStable] = useState<SensorData | null>(null);
  const recordsRef = useRef(records);
  const navigation = useNavigation();

  const isProfileComplete = () => {
    const ud: any = user?.userDetails as any;
    const gender = ud?.gender ?? (user as any)?.gender;
    const height = ud?.height ?? (user as any)?.height;
    const weight = ud?.weight ?? (user as any)?.weight;
    return Boolean(
      user?.name &&
      user?.email &&
      user?.age != null &&
      gender &&
      height != null &&
      weight != null
    );
  };

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    const ud: any = user?.userDetails as any;
    const gender = ud?.gender ?? (user as any)?.gender;
    const height = ud?.height ?? (user as any)?.height;
    const weight = ud?.weight ?? (user as any)?.weight;
    if (!user?.name) missing.push("Name");
    if (!user?.email) missing.push("Email");
    if (user?.age == null) missing.push("Age");
    if (!gender) missing.push("Gender");
    if (height == null) missing.push("Height");
    if (weight == null) missing.push("Weight");
    return missing;
  };

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  const fetchTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const measureTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      fetchTimer.current && clearInterval(fetchTimer.current);
      measureTimer.current && clearInterval(measureTimer.current);
      wave1.stopAnimation();
      wave2.stopAnimation();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      validStarted.current = false;
      setElapsed(0);
      setShowSummary(false);

      fetchTimer.current && clearInterval(fetchTimer.current);
      measureTimer.current && clearInterval(measureTimer.current);

      if (!isProfileComplete()) {
        setMeasuring(false);
        setWarning("");
        return () => {
          fetchTimer.current && clearInterval(fetchTimer.current);
          measureTimer.current && clearInterval(measureTimer.current);
          wave1.stopAnimation();
          wave2.stopAnimation();
        };
      }

      setWarning("");
      setMeasuring(true);
      setLoading(true);

      fetchTimer.current = setInterval(() => {
        fetchData();
      }, 1000);

      return () => {
        fetchTimer.current && clearInterval(fetchTimer.current);
        measureTimer.current && clearInterval(measureTimer.current);
        wave1.stopAnimation();
        wave2.stopAnimation();
      };
    }, [user])
  );

  const fetchData = async () => {
    try {
      if (!isProfileComplete() || !measuring) {
        return;
      }
      const { data } = await axios.get<SensorData>(`${baseURL}/data`);
      setHealthData(data);

      if (measuring) {
        if (data.bpm > 0) {
          setWarning("");
          setLastStable(data);

          if (!validStarted.current) {
            validStarted.current = true;
            animatePulse();
            setLoading(false);

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
      if (measuring) setHealthData(null);
    } finally {
    }
  };

  const stopMeasure = async (finalRecords: SensorData[]) => {
    setMeasuring(false);
    setLoading(false);
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

  const summaryLabelMap: Record<string, string> = useMemo(
    () => ({
      bpm: "Heart Rate",
      spo2: "SpO₂",
      temperature: "Body Temp",
      humidity: "Humidity",
      bodyTemperature: "Room Temp",
    }),
    []
  );

  const heartIcon = useMemo(() => (
    <FontAwesome5 name="heartbeat" size={48} color="#dc143c" />
  ), []);
  const lungsIcon = useMemo(() => (
    <MaterialCommunityIcons name="lungs" size={48} color="#50E3C2" />
  ), []);
  const bodyTempIcon = useMemo(() => (
    <MaterialIcons name="thermostat" size={48} color="#F5A623" />
  ), []);
  const humidityIcon = useMemo(() => (
    <MaterialCommunityIcons name="water-percent" size={48} color="#4A90E2" />
  ), []);
  const roomTempIcon = useMemo(() => (
    <MaterialIcons name="thermostat-auto" size={48} color="#9B59B6" />
  ), []);

  type AdviceItem = {
    key: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    icon: string;
  };

  const getAdvice = (): AdviceItem[] => {
    const items: AdviceItem[] = [];
    const validRecords = records.filter((r) => r.bpm > 0);
    if (validRecords.length === 0) return items;

    const pushItem = (key: string, title: string, message: string, severity: AdviceItem["severity"], icon: string) => {
      items.push({ key, title, message, severity, icon });
    };

    Object.entries(ranges).forEach(([k, r]) => {
      const v = avg(k as keyof SensorData);
      if (isNaN(v)) return;

      const tooLow = v < r.min;
      const tooHigh = v > r.max;
      const farLow = v < r.min - (r.max - r.min) * 0.2;
      const farHigh = v > r.max + (r.max - r.min) * 0.2;

      if (!(tooLow || tooHigh)) return;

      const sev: AdviceItem["severity"] = farLow || farHigh ? "critical" : "warning";

      if (k === "bpm") {
        if (tooLow)
          pushItem(
            k,
            "Low Heart Rate",
            `Your average heart rate is ${v} bpm. If you feel dizzy or fatigued, consider resting and consulting a professional. Hydration and gentle movement may help.`,
            sev,
            "❤️"
          );
        else
          pushItem(
            k,
            "High Heart Rate",
            `Your average heart rate is ${v} bpm. Try deep breathing for 2–3 minutes, reduce caffeine, and take a short break. If persistent, consult a professional.`,
            sev,
            "❤️"
          );
      } else if (k === "spo2") {
        if (tooLow)
          pushItem(
            k,
            "Low O₂ Levels",
            `SpO₂ is ${v}%. Sit upright, take slow deep breaths, and ensure proper finger placement on the sensor. If it stays low, seek medical attention.`,
            sev,
            "🫁"
          );
      } else if (k === "temperature") {
        pushItem(
          k,
          tooLow ? "Low Body Temp" : "High Body Temp",
          tooLow
            ? `Body temperature is ${v}°C. Warm up gradually and monitor. If you feel unwell, consult a professional.`
            : `Body temperature is ${v}°C. Hydrate, rest, and consider a cool environment. If fever persists, consult a professional.`,
          sev,
          "🌡️"
        );
      } else if (k === "humidity") {
        pushItem(
          k,
          tooLow ? "Low Room Humidity" : "High Room Humidity",
          tooLow
            ? `Humidity is ${v}%. Consider a humidifier or placing water near a heat source to improve comfort.`
            : `Humidity is ${v}%. Improve ventilation or use a dehumidifier to enhance comfort.`,
          sev,
          "💧"
        );
      } else if (k === "bodyTemperature") {
        pushItem(
          k,
          tooLow ? "Low Room Temp" : "High Room Temp",
          tooLow
            ? `Room temperature is ${v}°C. Add layers or increase heating for comfort.`
            : `Room temperature is ${v}°C. Improve airflow or cooling for comfort.`,
          sev,
          "🏠"
        );
      }
    });

    if (items.length === 0) {
      items.push({ key: "all-good", title: "All Good", message: "All vitals are within healthy ranges. Keep it up!", severity: "info", icon: "✅" });
    }

    const order = { critical: 0, warning: 1, info: 2 } as const;
    return items.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 6);
  };

  return (
    <LinearGradient colors={["#1E1E1E", "#121212"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Modal removed to avoid duplicate prompts */}
        {!showSummary && (
        <View style={styles.stats}>
          {/** choose displayed snapshot: live while valid measuring, else last stable */}
          {(() => {
            const displayed = measuring && validStarted.current && healthData?.bpm > 0 ? healthData : lastStable;
            return (
              <>
                <Vital
                  icon={heartIcon}
                  label="Heart"
                  val={displayed?.bpm ?? null}
                  unit="bpm"
                  loading={loading && measuring && validStarted.current}
                />
                <Vital
                  icon={lungsIcon}
                  label="O₂"
                  val={displayed?.spo2 ?? null}
                  unit="%"
                  loading={loading && measuring && validStarted.current}
                />
                <Vital
                  icon={bodyTempIcon}
                  label="Body Temp"
                  val={displayed?.temperature ?? null}
                  unit="°C"
                  loading={loading && measuring && validStarted.current}
                />
                <Vital
                  icon={humidityIcon}
                  label="Humidity"
                  val={displayed?.humidity ?? null}
                  unit="%"
                  loading={loading && measuring && validStarted.current}
                />
                <Vital
                  icon={roomTempIcon}
                  label="Room Temp"
                  val={displayed?.bodyTemperature ?? null}
                  unit="°C"
                  loading={loading && measuring && validStarted.current}
                />
              </>
            );
          })()}
        </View>
        )}

        {/* Incomplete profile banner positioned under the vitals */}
        {!isProfileComplete() && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.warning, { marginBottom: 12 }]}>
              ⚠️ Your profile is incomplete. Please fill in your personal details to start measuring.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("profile" as never)}
              style={{
                alignSelf: "center",
                backgroundColor: "#ff0051",
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {!!warning && (
          <Text style={[styles.warning, { marginBottom: 20 }]}>{warning}</Text>
        )}

        {showSummary && (
          <>
            {/* Measurement Summary with clean horizontal layout */}
            <View style={styles.summarySection}>
              <Text style={styles.header}>📊 Measurement Summary</Text>
              <View style={styles.summaryCard}>
                <VitalSummary
                  icon={<FontAwesome5 name="heartbeat" size={24} color="#dc143c" />}
                  label="Heart Rate"
                  value={avg("bpm")}
                  unit="bpm"
                  color={getBarColor("bpm", avg("bpm"))}
                  max={150}
                />
                <VitalSummary
                  icon={<MaterialCommunityIcons name="lungs" size={24} color="#50E3C2" />}
                  label="SpO₂"
                  value={avg("spo2")}
                  unit="%"
                  color={getBarColor("spo2", avg("spo2"))}
                  max={100}
                />
                <VitalSummary
                  icon={<MaterialIcons name="thermostat" size={24} color="#F5A623" />}
                  label="Body Temp"
                  value={avg("temperature")}
                  unit="°C"
                  color={getBarColor("temperature", avg("temperature"))}
                  max={40}
                />
                <VitalSummary
                  icon={<MaterialCommunityIcons name="water-percent" size={24} color="#4A90E2" />}
                  label="Humidity"
                  value={avg("humidity")}
                  unit="%"
                  color={getBarColor("humidity", avg("humidity"))}
                  max={100}
                />
                <VitalSummary
                  icon={<MaterialIcons name="thermostat-auto" size={24} color="#9B59B6" />}
                  label="Room Temp"
                  value={avg("bodyTemperature")}
                  unit="°C"
                  color={getBarColor("bodyTemperature", avg("bodyTemperature"))}
                  max={40}
                />
              </View>
            </View>

            <View style={styles.advice}>
              <Text style={styles.header}>💡 Health Advice</Text>
              {getAdvice().map((a) => (
                <View key={`${a.key}-${a.title}`} style={[styles.adviceCard, a.severity === "critical" ? styles.adviceCritical : a.severity === "warning" ? styles.adviceWarning : styles.adviceInfo]}>
                  <View style={styles.adviceHeaderRow}>
                    <Text style={styles.adviceIcon}>{a.icon}</Text>
                    <Text style={styles.adviceTitle}>{a.title}</Text>
                    <View style={styles.adviceBadgeWrap}>
                      <Text style={styles.adviceBadge}>{a.severity.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.adviceMessage}>{a.message}</Text>
                </View>
              ))}
            </View>

            {/* Back to Home Button */}
            <TouchableOpacity
              style={styles.backToHomeButton}
              onPress={() => navigation.navigate("MainTabs" as never)}
            >
              <MaterialIcons name="home" size={20} color="#fff" />
              <Text style={styles.backToHomeButtonText}>Back to Home</Text>
            </TouchableOpacity>
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
    </LinearGradient>
  );
}

const Vital = React.memo(({ icon, label, val, unit, loading }: any) => (
  <View style={styles.row}>
    {icon}
    <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
    <Text style={styles.value}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : val != null ? (
        `${Number(val).toFixed(1)} ${unit}`
      ) : (
        "--"
      )}
    </Text>
  </View>
));

const VitalSummary = React.memo(({ icon, label, value, unit, color, max }: any) => {
  const numValue = isNaN(value) ? 0 : Number(value);
  const percentage = Math.min(100, Math.max(0, (numValue / max) * 100));
  
  return (
    <View style={styles.vitalSummaryContainer}>
      <View style={styles.vitalSummaryInfo}>
        {icon}
        <Text style={styles.vitalSummaryLabel}>{label}</Text>
      </View>
      <View style={styles.vitalSummaryValueBar}>
        <Text style={[styles.vitalSummaryValue, { color }]}>
          {isNaN(value) ? "--" : `${numValue.toFixed(1)} ${unit}`}
        </Text>
        <View style={styles.vitalProgressBarBackground}>
          <View
            style={[
              styles.vitalProgressBar,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </View>
  );
});

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
  summarySection: { marginTop: 10 },
  summaryCard: {
    backgroundColor: "rgba(57, 56, 81, 0.8)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(138, 132, 255, 0.5)",
  },
  vitalSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  vitalSummaryInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: "35%",
  },
  vitalSummaryLabel: {
    fontSize: 14,
    color: "#E0E0E0",
    marginLeft: 10,
  },
  vitalSummaryValueBar: {
    flex: 1,
    marginLeft: 20,
  },
  vitalSummaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  vitalProgressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    marginTop: 5,
    overflow: "hidden",
  },
  vitalProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  advice: {
    marginTop: 40,
    paddingHorizontal: 5,
  },
  adviceCard: {
    backgroundColor: "#1f2233",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2b2f45",
  },
  adviceCritical: {
    borderColor: "#D9534F",
    shadowColor: "#D9534F",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  adviceWarning: {
    borderColor: "#F0AD4E",
    shadowColor: "#F0AD4E",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  adviceInfo: {
    borderColor: "#5CB85C",
    shadowColor: "#5CB85C",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  adviceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  adviceIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  adviceTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  adviceBadgeWrap: {
    backgroundColor: "#2b2f45",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adviceBadge: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  adviceMessage: {
    color: "#cfd4ff",
    fontSize: 14,
    lineHeight: 20,
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
  backToHomeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff0051",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#ff0051",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backToHomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
