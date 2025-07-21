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
  const [measurementsHistory, setMeasurementsHistory] = useState<HealthData[]>([]);
  const [selectedVital, setSelectedVital] = useState<VitalKey>("heartRate");
  const [displayMode, setDisplayMode] = useState<'last' | 'monthly'>('last');
  const [averageData, setAverageData] = useState<{data: HealthData | null, type: 'monthly' | 'overall'}>({ data: null, type: 'monthly' });
  const animatedProgress = React.useRef(new Animated.Value(0)).current;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const blinkAnimation = React.useRef(new Animated.Value(1)).current;

  const getMeasurementsHistoryByUserEmail = async () => {
    try {
      const response = await axios.get(`${USER_MEASUREMENTS}/all-by-user`, {
        params: { email: user?.email },
      });
      if (response.data && response.data.length > 0) {

        const sortedData = response.data.sort(
          (a: HealthData, b: HealthData) => {
            const dateA = new Date(a.dateOfMeasurement.replace(' ', 'T')).getTime();
            const dateB = new Date(b.dateOfMeasurement.replace(' ', 'T')).getTime();
            return dateB - dateA;
          }
        );
        setMeasurementsHistory(sortedData);
        setLastMeasurement(sortedData[0]);


      }
    } catch (error) {
      console.error("Error fetching measurements:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      getMeasurementsHistoryByUserEmail();
    }
  }, [user]);

  const calculateAverages = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let measurementsToAverage = measurementsHistory.filter(
      (m) => new Date(m.dateOfMeasurement.replace(' ', 'T')).getTime() >= thirtyDaysAgo.getTime()
    );

    let averageType: 'monthly' | 'overall' = 'monthly';

    if (measurementsToAverage.length === 0 && measurementsHistory.length > 0) {
      measurementsToAverage = measurementsHistory;
      averageType = 'overall';
    }

    if (measurementsToAverage.length > 0) {
      const sums: any = { heartRate: 0, oxygen: 0, temperature: 0, roomTemperature: 0, humidity: 0 };
      const counts: any = { heartRate: 0, oxygen: 0, temperature: 0, roomTemperature: 0, humidity: 0 };

      for (const measurement of measurementsToAverage) {
        for (const key of Object.keys(sums)) {
          if (measurement[key as keyof HealthData] != null) {
            sums[key] += measurement[key as keyof HealthData] as number;
            counts[key]++;
          }
        }
      }

      const averages: Partial<HealthData> = { dateOfMeasurement: new Date().toISOString(), id: 'average' };
      for (const key of Object.keys(sums)) {
        if (counts[key] > 0) {
          (averages as any)[key] = sums[key] / counts[key];
        }
      }
      setAverageData({ data: averages as HealthData, type: averageType });
    } else {
      setAverageData({ data: null, type: 'monthly' });
    }
  };

  useEffect(() => {
    if (measurementsHistory.length > 0) {
      calculateAverages();
    }
  }, [measurementsHistory]);

  const dataToDisplay = displayMode === 'last' ? lastMeasurement : averageData.data;

  const isCritical = dataToDisplay && dataToDisplay[selectedVital] != null &&
    (dataToDisplay[selectedVital] < vitalDetails[selectedVital].range[0] ||
     dataToDisplay[selectedVital] > vitalDetails[selectedVital].range[1]);
  const averageLabel = averageData.type === 'overall' ? 'Overall Average' : 'Monthly Average';

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

  const togglePicker = () => {
    const toValue = isPickerOpen ? 0 : 1;
    setIsPickerOpen(!isPickerOpen);
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (dataToDisplay) {
      animatedProgress.setValue(0);
      const progress = dataToDisplay[selectedVital] != null
        ? Math.max(0, Math.min(1, (dataToDisplay[selectedVital] - vitalDetails[selectedVital].range[0]) / (vitalDetails[selectedVital].range[1] - vitalDetails[selectedVital].range[0])))
        : 0;

      Animated.timing(animatedProgress, {
        toValue: isCritical ? 1 : progress,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      if (isCritical) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(blinkAnimation, { toValue: 0.3, duration: 700, useNativeDriver: true }),
            Animated.timing(blinkAnimation, { toValue: 1, duration: 700, useNativeDriver: true }),
          ])
        ).start();
      } else {
        blinkAnimation.stopAnimation();
        blinkAnimation.setValue(1);
      }
    }

    return () => blinkAnimation.stopAnimation();
  }, [selectedVital, dataToDisplay, isCritical]);

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
            <View style={styles.sectionHeaderContainer}>
      
              <View style={styles.pickerContainer}>
                <TouchableOpacity onPress={togglePicker} style={styles.pickerHeader}>
                  <Text style={styles.pickerHeaderText}>
                    {displayMode === 'last' ? 'Last Measurement' : 'Monthly Average'}
                  </Text>
                  <Ionicons name={isPickerOpen ? "chevron-up" : "chevron-down"} size={20} color="white" />
                </TouchableOpacity>
                <Animated.View style={[styles.pickerDropdown, { height: animatedHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }]}>
                  <TouchableOpacity style={styles.pickerOption} onPress={() => { setDisplayMode('last'); togglePicker(); }}>
                    <Text style={styles.pickerOptionText}>Last Measurement</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerOption} onPress={() => { setDisplayMode('monthly'); togglePicker(); }}>
                    <Text style={styles.pickerOptionText}>Monthly Average</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {dataToDisplay && (
              <Text style={styles.measurementDate}>
                {displayMode === 'last'
                  ? `Last measurement: ${new Date(
                      lastMeasurement?.dateOfMeasurement?.replace(' ', 'T') || ''
                    ).toLocaleString()}`
                  : `Average of all available data`}
              </Text>
            )}

            {dataToDisplay ? (
              <>
                <View style={styles.gaugeContainer}>
                  <Svg height="220" width="220" viewBox="0 0 220 220">
                    <Circle
                      cx="110"
                      cy="110"
                      r="85"
                      stroke="#3A3A5A"
                      strokeWidth="25"
                      fill="transparent"
                    />
                      <AnimatedCircle
                        cx="110"
                        cy="110"
                        r="85"
                        stroke={isCritical ? '#ff0000' : (dataToDisplay[selectedVital] >= vitalDetails[selectedVital].goodRange[0] && dataToDisplay[selectedVital] <= vitalDetails[selectedVital].goodRange[1] ? "#00FF7F" : "#FF453A")}
                        opacity={isCritical ? blinkAnimation : 1}
                        strokeWidth="25"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 85}
                        strokeDashoffset={animatedProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            2 * Math.PI * 85,
                            2 * Math.PI * 85 * (1 - (isCritical ? 1 : Math.max(0, Math.min(1, (dataToDisplay[selectedVital] - vitalDetails[selectedVital].range[0]) / (vitalDetails[selectedVital].range[1] - vitalDetails[selectedVital].range[0])))))
                          ],
                        })}
                        strokeLinecap="round"
                        transform="rotate(-90 110 110)"
                      />
                  </Svg>
                  <View style={styles.gaugeTextContainer}>
                    {dataToDisplay && dataToDisplay[selectedVital] != null ? (
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                          <Text style={styles.vitalValue}>
                            {dataToDisplay[selectedVital].toFixed(1)}
                          </Text>
                          <Text style={styles.vitalUnit}>
                            {vitalDetails[selectedVital].unit}
                          </Text>
                        </View>
                        {isCritical && <Text style={styles.criticalText}>Critical</Text>}
                      </View>
                    ) : (
                      <Text style={[styles.vitalValue, { fontSize: 18, textAlign: 'center' }]}>
                        {displayMode === 'monthly' ? `No data for ${averageLabel} average` : '--'}
                      </Text>
                    )}
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
                    <Ionicons
                      name="chevron-forward-outline"
                      size={30}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.gaugeContainer}>
                <Text style={styles.vitalValue}>No data available</Text>
              </View>
            )}
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
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  pickerContainer: {
    width: '60%',
    position: 'relative',
    zIndex: 1,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 132, 255, 0.5)',
    borderRadius: 8,
    backgroundColor: 'rgba(57, 56, 81, 0.8)',
  },
  pickerHeaderText: {
    color: 'white',
    fontSize: 16,
  },
  pickerDropdown: {
    position: 'absolute',
    top: '100%',
    width: '100%',
    backgroundColor: 'rgba(57, 56, 81, 0.9)',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
  },
  pickerOptionText: {
    color: 'white',
    fontSize: 16,
  },
  measurementDate: {
    color: '#BDBDBD',
    fontSize: 14,
    marginBottom: 15,
    width: '100%',
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
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
  },
  vitalValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  criticalText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  vitalUnit: {
    fontSize: 16,
    color: "#ccc",
    marginLeft: 5,
    alignSelf: 'flex-end',
    marginBottom: 8,
    fontWeight: '600',
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
