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
  const [measuring, setMeasuring] = useState(true); // starts measuring immediately
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<SensorData[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const { user } = useAppContext();
  const [warning, setWarning] = useState("");
  const validStarted = useRef(false);
  const [lastStable, setLastStable] = useState<SensorData | null>(null);
  const recordsRef = useRef(records);
  const navigation = useNavigation();
  // Removed modal; using only inline banner for incomplete profile

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fetchTimer.current && clearInterval(fetchTimer.current);
      measureTimer.current && clearInterval(measureTimer.current);
      wave1.stopAnimation();
      wave2.stopAnimation();
    };
  }, []);

  // Re-evaluate and (re)start measurement when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Reset state on focus
      validStarted.current = false;
      setElapsed(0);
      setShowSummary(false);

      // Stop any existing timers
      fetchTimer.current && clearInterval(fetchTimer.current);
      measureTimer.current && clearInterval(measureTimer.current);

      if (!isProfileComplete()) {
        setMeasuring(false);
        // Do not use the generic warning; we'll show a single inline banner with action
        setWarning("");
        return () => {
          fetchTimer.current && clearInterval(fetchTimer.current);
          measureTimer.current && clearInterval(measureTimer.current);
          wave1.stopAnimation();
          wave2.stopAnimation();
        };
      }

      // Profile is complete – allow measuring
      setWarning("");
      setMeasuring(true);
      setLoading(true); // show initial spinner until first valid sample

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
      // Guard: do not fetch/measure when profile is incomplete
      if (!isProfileComplete() || !measuring) {
        return;
      }
      const { data } = await axios.get<SensorData>(`${baseURL}/data`);
      setHealthData(data);

      if (measuring) {
        if (data.bpm > 0) {
          setWarning("");
          // Cache a stable sample so UI can show non-blinking values when not measuring
          setLastStable(data);

          if (!validStarted.current) {
            validStarted.current = true;
            animatePulse();
            setLoading(false); // stop initial spinner when first valid data seen

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
      // Avoid clearing values when not measuring to prevent flicker
      if (measuring) setHealthData(null);
    } finally {
      // do not toggle loading here; it's controlled by focus/first valid/stop
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

  // Friendly labels for summary section (avoid all-caps and long technical keys)
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

  // Memoized icons (defined at top-level to keep hook order stable regardless of conditional rendering)
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
    icon: string; // emoji for lightweight UI
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
            {/* Session Trends becomes the primary section */}
            {records.filter((r) => r.bpm > 0).length > 1 && (
              <View style={styles.trendsSection}>
                <Text style={styles.header}>Session Trends</Text>
                {([
                  { key: "bpm", label: "Heart Rate", unit: "bpm" },
                  { key: "spo2", label: "SpO₂", unit: "%" },
                  { key: "temperature", label: "Body Temp", unit: "°C" },
                  { key: "humidity", label: "Humidity", unit: "%" },
                  { key: "bodyTemperature", label: "Room Temp", unit: "°C" },
                ] as Array<{ key: keyof SensorData; label: string; unit: string }>).map(({ key, label, unit }) => {
                  const series = records
                    .filter((r) => r.bpm > 0)
                    .map((r) => Number(r[key] ?? 0))
                    .slice(-70); // use ~70 samples to better fill width with wider bars
                  if (series.length < 2) return null;
                  const min = Math.min(...series);
                  const max = Math.max(...series);
                  const avgVal = series.reduce((s, v) => s + v, 0) / series.length;
                  const range = Math.max(1, max - min);
                  return (
                    <View key={String(key)} style={styles.trendCard}>
                      <View style={styles.trendHeaderRow}>
                        <Text style={styles.trendLabel} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
                        <Text style={styles.trendStats}>{`${avgVal.toFixed(1)} ${unit}`}</Text>
                      </View>
                      <View style={styles.sparklineRow}>
                        {series.map((v, i) => {
                          const h = 8 + ((v - min) / range) * 40; // 8-48 px height (more compact vertically)
                          return <View key={i} style={[styles.sparkBar, { height: h, backgroundColor: getBarColor(String(key), v) }]} />;
                        })}
                      </View>
                      <View style={styles.trendFooterRow}>
                        <Text style={styles.trendMinMax}>{`min ${min.toFixed(1)}${unit ? " " + unit : ""}`}</Text>
                        <Text style={styles.trendMinMax}>{`max ${max.toFixed(1)}${unit ? " " + unit : ""}`}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.advice}>
              <Text style={styles.header}>💡 Advice</Text>
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
  trendsSection: { marginTop: 10 },
  trendCard: {
    backgroundColor: "#1f2233",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2b2f45",
  },
  trendHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  trendLabel: { flex: 1, color: "#ddd", fontSize: 16, fontWeight: "700" },
  trendStats: { color: "#cfd4ff", fontSize: 14, fontWeight: "600" },
  sparklineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 56,
    marginTop: 4,
    marginBottom: 6,
  },
  sparkBar: {
    width: 6,
    borderRadius: 3,
    marginRight: 2,
    backgroundColor: "#5CB85C",
  },
  trendFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendMinMax: { color: "#9aa3c7", fontSize: 12 },
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
});
