import HealthData from "@/constants/HealthData";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
            const dateA = new Date(a.dateOfMeasurement.replace(' ', 'T')).getTime();
            const dateB = new Date(b.dateOfMeasurement.replace(' ', 'T')).getTime();
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
    <ScrollView style={styles.container}>

      <Text style={styles.sectionTitle}>History</Text>

      {healthData?.map((data, index) => (
        <View key={index} style={styles.sensorCard}>
          <Text style={styles.sensorDate}>
            {new Date(data.dateOfMeasurement.replace(' ', 'T')).toLocaleString()}
          </Text>

          <View style={styles.sensorDataRow}>
            <View style={styles.sensorDataItem}>
              <Ionicons name="thermometer" size={20} color="#ff6347" />
              <Text style={styles.sensorLabel}>Body Temp</Text>
              <Text style={styles.sensorValue}>{data.temperature}</Text>
            </View>
            <View style={styles.sensorDataItem}>
              <MaterialIcons name="thermostat" size={20} color="#1e90ff" />
              <Text style={styles.sensorLabel}>Room Temp</Text>
              <Text style={styles.sensorValue}>{data.roomTemperature}</Text>
            </View>
          </View>

          <View style={styles.sensorDataRow}>
            <View style={styles.sensorDataItem}>
              <MaterialCommunityIcons
                name="water-percent"
                size={20}
                color="#00bfff"
              />
              <Text style={styles.sensorLabel}>Humidity</Text>
              <Text style={styles.sensorValue}>{data.humidity}</Text>
            </View>
            <View style={styles.sensorDataItem}>
              <FontAwesome5 name="heartbeat" size={20} color="#dc143c" />
              <Text style={styles.sensorLabel}>Pulse</Text>
              <Text style={styles.sensorValue}>{data.heartRate}</Text>
            </View>
          </View>

          <View style={styles.sensorDataRow}>
            <View style={styles.sensorDataItem}>
              <MaterialCommunityIcons
                name="water-opacity"
                size={20}
                color="#4caf50"
              />
              <Text style={styles.sensorLabel}>SpO₂</Text>
              <Text style={styles.sensorValue}>{data.oxygen}</Text>
            </View>
            <View style={styles.sensorDataItem} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default History;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#F7F8FA",
    flex: 1,
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
    color: "#555",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  promoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 12,
    color: "#555",
  },
  promoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  sensorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorDate: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
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
    color: "#666",
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0077b6",
    marginTop: 2,
  },
});
