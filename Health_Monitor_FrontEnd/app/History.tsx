import HealthData from "@/constants/HealthData";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
} from "react-native";
import { NavigationProp, useNavigation, useFocusEffect } from "@react-navigation/native";

const HealthMetric = ({ icon, label, value, unit, color, max }) => {
  const percentage = Math.min(100, (parseFloat(value) / max) * 100);
  return (
    <View style={styles.metricContainer}>
      <View style={styles.metricInfo}>
        {icon}
        <Text style={styles.sensorLabel}>{label}</Text>
      </View>
      <View style={styles.metricValueBar}>
        <Text
          style={[styles.sensorValue, { color }]}
        >{`${value} ${unit}`}</Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBar,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </View>
  );
};
import { LinearGradient } from "expo-linear-gradient";
import { USER_MEASUREMENTS } from "@/config/axiosConfig";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { baseURL } from "@/config/axiosConfig";

function History() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user } = useAppContext();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const isDoctorDetailsComplete = () => {
    return Boolean(
      user?.doctorDetails?.doctorEmail?.trim() &&
      user?.doctorDetails?.doctorName?.trim()
    );
  };

  const handleSendEmail = async (report: HealthData) => {
    if (!isDoctorDetailsComplete()) {
      Alert.alert(
        "Doctor Details Incomplete",
        "Please add your doctor's name and email in the profile section first."
      );
      return;
    }

    const latestReport = report;
    const subject = `Health Report for ${user.name}`;
    const body = `
Hello Dr. ${user.doctorDetails.doctorName || ""},

Here is my latest health report from ${new Date(
      latestReport.dateOfMeasurement.replace(" ", "T")
    ).toLocaleString()}:

- Body Temperature: ${latestReport.temperature}°C
- Room Temperature: ${latestReport.roomTemperature}°C
- Humidity: ${latestReport.humidity}%
- Heart Rate: ${latestReport.heartRate} BPM
- SpO2: ${latestReport.oxygen}%

Thank you,
${user.name}
    `;

    try {
      await axios.post(`${baseURL}/api/email/send`, {
        from: user.email,
        fromName: user.name,
        to: user.doctorDetails.doctorEmail,
        subject,
        body,
      });
      setMessageType("success");
      setMessage(
        "Your health report has been successfully sent to your doctor."
      );
    } catch (error) {
      console.error("Failed to send email:", error);
      setMessageType("error");
      setMessage(
        "Failed to send the report. Please check your connection and try again."
      );
    }
  };

  const [healthData, setHealthData] = useState<HealthData[]>([]);

  const getMeasurementsHistoryByUserEmail = async () => {
    if (!user?.email) {
      setHealthData([]);
      return;
    }
    try {
      const response = await axios.get(`${USER_MEASUREMENTS}/all-by-user`, {
        params: { email: user.email },
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

  useFocusEffect(
    useCallback(() => {
      getMeasurementsHistoryByUserEmail();
    }, [user?.email])
  );

  return (
    <LinearGradient
      colors={["#050505", "#1c1c1c", "#2a2a3d"]}
      style={styles.container}
    >
      <ScrollView>
        <Text style={styles.sectionTitle}>Measurement History</Text>
        
        {/* Doctor details incomplete banner */}
        {!isDoctorDetailsComplete() && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Doctor details incomplete. Please add your doctor's information to send health reports.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("profile" as never)}
              style={styles.warningButton}
            >
              <Text style={styles.warningButtonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {(!healthData || healthData.length === 0) ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="chart-line" size={56} color="#8A84FF" />
            <Text style={styles.emptyTitle}>No measurements found</Text>
            <Text style={styles.emptySubtitle}>
              Take a quick measurement to start building your history.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("Monitoring")}
            >
              <Text style={styles.emptyButtonText}>Measure now</Text>
            </TouchableOpacity>
          </View>
        ) : healthData?.map((data, index) => (
          <View key={index} style={styles.sensorCard}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#aaa" />
              <Text style={styles.dateText}>
                {new Date(
                  data.dateOfMeasurement.replace(" ", "T")
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.timeText}>
                {new Date(
                  data.dateOfMeasurement.replace(" ", "T")
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
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
                icon={
                  <MaterialIcons name="thermostat" size={24} color="#1e90ff" />
                }
                label="Room Temp"
                value={data.roomTemperature}
                unit="°C"
                color="#1e90ff"
                max={40}
              />
              <HealthMetric
                icon={
                  <MaterialCommunityIcons
                    name="water-percent"
                    size={24}
                    color="#00bfff"
                  />
                }
                label="Humidity"
                value={data.humidity}
                unit="%"
                color="#00bfff"
                max={100}
              />
              <HealthMetric
                icon={
                  <FontAwesome5 name="heartbeat" size={24} color="#dc143c" />
                }
                label="Pulse"
                value={data.heartRate}
                unit="BPM"
                color="#dc143c"
                max={150}
              />
              <HealthMetric
                icon={
                  <MaterialCommunityIcons
                    name="water-opacity"
                    size={24}
                    color="#4caf50"
                  />
                }
                label="SpO₂"
                value={data.oxygen}
                unit="%"
                color="#4caf50"
                max={100}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                !isDoctorDetailsComplete() && styles.sendButtonDisabled
              ]}
              onPress={() => handleSendEmail(data)}
              disabled={!isDoctorDetailsComplete()}
            >
              <Ionicons 
                name="send-outline" 
                size={18} 
                color={!isDoctorDetailsComplete() ? "#666" : "#fff"} 
              />
              <Text style={[
                styles.sendButtonText,
                !isDoctorDetailsComplete() && styles.sendButtonTextDisabled
              ]}>
                Send to my doctor
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!message}
        onRequestClose={() => {
          setMessage("");
        }}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              messageType === "success"
                ? styles.successMessage
                : styles.errorMessage,
            ]}
          >
            <Ionicons
              name={
                messageType === "success"
                  ? "checkmark-circle-outline"
                  : "alert-circle-outline"
              }
              size={48}
              color={"#fff"}
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.modalText}>{message}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMessage("")}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  timeText: {
    fontSize: 14,
    color: "#ccc",
    marginLeft: "auto",
  },
  metricsList: {
    marginTop: 10,
  },
  metricContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metricInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: "35%",
  },
  sensorLabel: {
    fontSize: 14,
    color: "#E0E0E0",
    marginLeft: 10,
  },
  metricValueBar: {
    flex: 1,
    marginLeft: 20,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    marginTop: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff0051",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  successMessage: {
    backgroundColor: "#2E8B57",
  },
  errorMessage: {
    backgroundColor: "#DC143C",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#ff0051',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  warningText: {
    color: '#F5A623',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  warningButton: {
    alignSelf: 'center',
    backgroundColor: '#ff0051',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  warningButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
  sendButtonTextDisabled: {
    color: '#666',
  },
});
