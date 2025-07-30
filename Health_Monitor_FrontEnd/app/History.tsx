import HealthData from "@/constants/HealthData";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// A new component to render each health metric with a progress bar
const HealthMetric = ({ icon, label, value, unit, color, max }) => {
  const percentage = Math.min(100, (parseFloat(value) / max) * 100);
  return (
    <View style={styles.metricContainer}>
      <View style={styles.metricInfo}>
        {icon}
        <Text style={styles.sensorLabel}>{label}</Text>
      </View>
      <View style={styles.metricValueBar}>
        <Text style={[styles.sensorValue, { color }]}>{`${value} ${unit}`}</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};
import { LinearGradient } from "expo-linear-gradient";
import { USER_MEASUREMENTS } from "@/config/axiosConfig";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";

function History() {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const { user } = useAppContext();

  const getMeasurementsHistoryByUserEmail = async () => {
    try {
      const response = await axios.get(`${USER_MEASUREMENTS}/all-by-user`, {
        params: { email: user?.email },
      });
      if (response.data) {
        const sortedData = response.data.sort(
          (a: HealthData, b: HealthData) => {
            const dateA = new Date(
              a.dateOfMeasurement.replace(" ", "T")
            ).getTime();
            const dateB = new Date(
              b.dateOfMeasurement.replace(" ", "T")
            ).getTime();
            return dateB - dateA;
          }
        );
        setHealthData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching measurements:", error);
    }
  };

  useEffect(() => {
    getMeasurementsHistoryByUserEmail();
  }, [user]);

  return (
    <LinearGradient
      colors={["#050505", "#1c1c1c", "#2a2a3d"]}
      style={styles.container}
    >
      <ScrollView>
        <Text style={styles.sectionTitle}>Measurement History</Text>

        {healthData?.map((data, index) => (
          <View key={index} style={styles.sensorCard}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#aaa" />
              <Text style={styles.dateText}>
                {new Date(data.dateOfMeasurement.replace(' ', 'T')).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.timeText}>
                {new Date(data.dateOfMeasurement.replace(' ', 'T')).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>

            <View style={styles.metricsList}>
              <HealthMetric
                icon={<Ionicons name="thermometer" size={24} color="#ff6347" />}
                label="Body Temp"
                value={data.temperature}
                unit="°C"
                color="#ff6347"
                max={40}
              />
              <HealthMetric
                icon={<MaterialIcons name="thermostat" size={24} color="#1e90ff" />}
                label="Room Temp"
                value={data.roomTemperature}
                unit="°C"
                color="#1e90ff"
                max={40}
              />
              <HealthMetric
                icon={<MaterialCommunityIcons name="water-percent" size={24} color="#00bfff" />}
                label="Humidity"
                value={data.humidity}
                unit="%"
                color="#00bfff"
                max={100}
              />
              <HealthMetric
                icon={<FontAwesome5 name="heartbeat" size={24} color="#dc143c" />}
                label="Pulse"
                value={data.heartRate}
                unit="BPM"
                color="#dc143c"
                max={150}
              />
              <HealthMetric
                icon={<MaterialCommunityIcons name="water-opacity" size={24} color="#4caf50" />}
                label="SpO₂"
                value={data.oxygen}
                unit="%"
                color="#4caf50"
                max={100}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    backgroundColor: "rgba(57, 56, 81, 0.8)",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    textAlign: "center",
    overflow: "hidden",
  },
  sensorCard: {
    backgroundColor: "rgba(57, 56, 81, 0.8)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(138, 132, 255, 0.5)",
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 'auto',
  },
    metricsList: {
    marginTop: 10,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '35%',
  },
  sensorLabel: {
    fontSize: 14,
    color: '#E0E0E0',
    marginLeft: 10,
  },
  metricValueBar: {
    flex: 1,
    marginLeft: 10,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
