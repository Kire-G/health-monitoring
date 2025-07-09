import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { baseURL } from "@/config/axiosConfig";
import axios from "axios";
import HealthData from "@/constants/HealthData";
import SensorData from "@/constants/SensorData";

export default function Monitoring() {
  const [healthData, setHealthData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<SensorData>(`${baseURL}/data`);
      setHealthData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  const startMeasuring = () => {
    // Fetch immediately once pressed
    fetchHealthData();

    // Then start interval
    intervalRef.current = setInterval(() => {
      fetchHealthData();
    }, 1000);
  };

  const stopMeasuring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
  };

  useEffect(() => {
    return () => {
      // Clear interval on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const displayValue = (value: number | undefined) =>
    value !== undefined && value !== null ? value.toString() : "--";

  return (
    <View style={styles.container}>
      <View style={styles.dataRow}>
        <FontAwesome5 name="heartbeat" size={36} color="#dc143c" />
        <Text style={styles.label}>Heart Rate</Text>
        <Text style={styles.value}>
          {loading && measuring ? (
            <ActivityIndicator color="#dc143c" />
          ) : (
            displayValue(healthData?.bpm)
          )}{" "}
          bpm
        </Text>
      </View>

      <View style={styles.dataRow}>
        <MaterialCommunityIcons name="lungs" size={36} color="#50E3C2" />
        <Text style={styles.label}>Oxygen</Text>
        <Text style={styles.value}>
          {loading && measuring ? (
            <ActivityIndicator color="#50E3C2" />
          ) : (
            displayValue(healthData?.spo2)
          )}{" "}
          %
        </Text>
      </View>

      <View style={styles.dataRow}>
        <MaterialIcons name="thermostat" size={36} color="#F5A623" />
        <Text style={styles.label}>Temperature</Text>
        <Text style={styles.value}>
          {loading && measuring ? (
            <ActivityIndicator color="#F5A623" />
          ) : (
            displayValue(healthData?.temperature)
          )}{" "}
          °C
        </Text>
      </View>

      <View style={styles.dataRow}>
        <MaterialCommunityIcons
          name="water-percent"
          size={36}
          color="#4A90E2"
        />
        <Text style={styles.label}>Humidity</Text>
        <Text style={styles.value}>
          {loading && measuring ? (
            <ActivityIndicator color="#4A90E2" />
          ) : (
            displayValue(healthData?.humidity)
          )}{" "}
          %
        </Text>
      </View>

      <View style={styles.dataRow}>
        <MaterialIcons name="thermostat-auto" size={36} color="#9B59B6" />
        <Text style={styles.label}>Room Temp</Text>
        <Text style={styles.value}>
          {loading && measuring ? (
            <ActivityIndicator color="#9B59B6" />
          ) : (
            displayValue(healthData?.temperature)
          )}{" "}
          °C
        </Text>
      </View>

      <View style={styles.pingerContainer}>
        <TouchableOpacity
          style={[styles.pinger, measuring && { backgroundColor: "#444" }]}
          onPressIn={startMeasuring}
          onPressOut={stopMeasuring}
        >
          <Text style={styles.pingerText}>
            {measuring ? "Measuring..." : "Hold to Measure"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1f1f3f",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  value: {
    width: 80,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "right",
  },
  pingerContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pinger: {
    backgroundColor: "#dc143c",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  pingerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
