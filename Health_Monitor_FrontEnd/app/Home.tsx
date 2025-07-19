import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import arrow from "../assets/images/arrow_forward_ios_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { USER_MEASUREMENTS } from "@/config/axiosConfig";
import HealthData from "@/constants/HealthData";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type VitalKey = "heartRate" | "temperature" | "roomTemperature" | "humidity" | "oxygen";

const vitalDetails: Record<
  VitalKey,
  {
    label: string;
    unit: string;
    range: [number, number];
    goodRange: [number, number];
    gradient: [string, string];
  }
> = {
  heartRate: {
    label: "Heart Rate",
    unit: "BPM",
    range: [40, 160],
    goodRange: [60, 100],
    gradient: ["#FF6B6B", "#FFB3B3"],
  },
  oxygen: {
    label: "SpO₂",
    unit: "%",
    range: [90, 100],
    goodRange: [95, 100],
    gradient: ["#32CD32", "#98FB98"],
  },
  temperature: {
    label: "Body Temp",
    unit: "°C",
    range: [35, 42],
    goodRange: [36.5, 37.5],
    gradient: ["#4D96FF", "#9ED2FF"],
  },
  roomTemperature: {
    label: "Room Temp",
    unit: "°C",
    range: [15, 35],
    goodRange: [20, 25],
    gradient: ["#6BDBFF", "#B5EEFF"],
  },
  humidity: {
    label: "Humidity",
    unit: "%",
    range: [0, 100],
    goodRange: [30, 60],
    gradient: ["#4B0082", "#8A2BE2"],
  },
};

export default function Home() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user } = useAppContext();
  const [lastMeasurement, setLastMeasurement] = useState<HealthData | null>(null);
  const [selectedVital, setSelectedVital] = useState<VitalKey>("heartRate");
  const animatedProgress = React.useRef(new Animated.Value(0)).current;

  const getMeasurementsHistoryByUserEmail = async () => {
    try {
      const response = await axios.get(`${USER_MEASUREMENTS}/all-by-user`, {
        params: { email: user.email },
      });
      const allMeasurements = response.data;
      if (allMeasurements && allMeasurements.length > 0) {
        // Take the last 5 measurements
        setLastMeasurement(allMeasurements[allMeasurements.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching measurements:", error);
    }
  };

  useEffect(() => {
    if (lastMeasurement) {
      animatedProgress.setValue(0);
      Animated.timing(animatedProgress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [lastMeasurement, selectedVital]);

  useEffect(() => {
    if (user?.email) {
      getMeasurementsHistoryByUserEmail();
    }
  }, [user]);

  const handleNextVital = () => {
    const vitalKeys = Object.keys(vitalDetails) as VitalKey[];
    const currentIndex = vitalKeys.indexOf(selectedVital);
    const nextIndex = (currentIndex + 1) % vitalKeys.length;
    setSelectedVital(vitalKeys[nextIndex]);
  };

  const handlePreviousVital = () => {
    const vitalKeys = Object.keys(vitalDetails) as VitalKey[];
    const currentIndex = vitalKeys.indexOf(selectedVital);
    const prevIndex = (currentIndex - 1 + vitalKeys.length) % vitalKeys.length;
    setSelectedVital(vitalKeys[prevIndex]);
  };

  return (
    <LinearGradient
      colors={["#f90d46", "#17172e", "#050505", "#050505"]}
      start={{ x: -0.7, y: 0 }}
      end={{ x: 1, y: 1.1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hello</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.servicesRow}>
          <View style={styles.serviceIcon}>
            <Ionicons name="person" size={24} color="#4A90E2" />
          </View>
          <View style={styles.serviceIcon}>
            <FontAwesome5 name="file-alt" size={20} color="#F5A623" />
          </View>
          <View style={styles.serviceIcon}>
            <MaterialIcons name="event" size={24} color="#50E3C2" />
          </View>
          <View style={styles.serviceIcon}>
            <MaterialCommunityIcons name="virus" size={24} color="#D0021B" />
          </View>
        </View>

        <LinearGradient
          colors={["#45446a", "#393851"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoCard}
        >
          <View style={{ flex: 1 }}>
            <FontAwesome5 name="heartbeat" size={66} color="#ff0051" />
          </View>
          <TouchableOpacity
            style={styles.measureButton}
            onPress={() => navigation.navigate("Monitoring")}
          >
            <Text style={styles.measureText}>Measure now</Text>
            <Image source={arrow} style={styles.arrowIcon} />
          </TouchableOpacity>
        </LinearGradient>

        {lastMeasurement && (
          <View style={styles.interactiveContainer}>
            <Text style={styles.sectionHeader}>Last Measurement</Text>
            <View style={styles.gaugeContainer}>
              <Svg
                height={Dimensions.get("window").width * 0.55}
                width={Dimensions.get("window").width * 0.55}
                viewBox="0 0 220 220"
              >
                <Circle
                  cx="110"
                  cy="110"
                  r="85"
                  stroke="#393851"
                  strokeWidth="25"
                  fill="transparent"
                />
                <AnimatedCircle
                  cx="110"
                  cy="110"
                  r="85"
                  stroke={
                    lastMeasurement[selectedVital] >=
                      vitalDetails[selectedVital].goodRange[0] &&
                    lastMeasurement[selectedVital] <=
                      vitalDetails[selectedVital].goodRange[1]
                      ? "#00FF7F"
                      : "#FF453A"
                  }
                  strokeWidth="25"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 85}
                  strokeDashoffset={animatedProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      2 * Math.PI * 85,
                      2 *
                        Math.PI *
                        85 *
                        (1 -
                          Math.max(
                            0,
                            Math.min(
                              1,
                              (lastMeasurement[selectedVital] -
                                vitalDetails[selectedVital].range[0]) /
                                (vitalDetails[selectedVital].range[1] -
                                  vitalDetails[selectedVital].range[0])
                            )
                          )),
                    ],
                  })}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                />
              </Svg>
              <View style={styles.gaugeTextContainer}>
                <Text style={styles.gaugeValue}>
                  {lastMeasurement[selectedVital]}
                  <Text style={styles.gaugeUnit}>
                    {vitalDetails[selectedVital].unit}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.vitalSelector}>
              <TouchableOpacity onPress={handlePreviousVital}>
                <Ionicons name="chevron-back-outline" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.vitalName}>
                {vitalDetails[selectedVital].label}
              </Text>
              <TouchableOpacity onPress={handleNextVital}>
                <Ionicons name="chevron-forward-outline" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const chartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "#050505",
  backgroundGradientTo: "#050505",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#ffa726",
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  hello: {
    fontSize: 16,
    color: "#FFF",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  promoCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  measureButton: {
    backgroundColor: "#ff0051",
    width: 170,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
    gap: 5,
  },
  measureText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    paddingBottom: 3,
  },
  arrowIcon: {
    tintColor: "white",
    width: 20,
    height: 20,
  },
  interactiveContainer: {
    alignItems: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  gaugeContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    borderRadius: 16,
    overflow: "hidden",
  },
  gaugeTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeValue: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  gaugeUnit: {
    fontSize: 26,
    color: '#a0a0b0',
    fontWeight: '500',
  },
  vitalSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  vitalName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    marginTop: 10,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: "#393851",
    borderRadius: 16,
    padding: 15,
    width: "32%",
    marginBottom: 10,
    alignItems: "center",
  },
  metricLabel: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
  },
  metricValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  progressChartsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  progressCard: {
    backgroundColor: "#393851",
    borderRadius: 16,
    padding: 15,
    width: "48%",
    alignItems: "center",
  },
  sensorCard: {
    backgroundColor: "#2a2a3d",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sensorDate: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
  },
  sensorDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sensorDataItem: {
    flex: 1,
    alignItems: "center",
  },
  sensorLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#ccc",
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 2,
  },
});
