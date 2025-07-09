import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import arrow from "../assets/images/arrow_forward_ios_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const { user } = useAppContext();
  const navigation = useNavigation<any>();

  return (
    <>
      <LinearGradient
        colors={["#f90d46", "#17172e", "#050505", "#050505"]}
        start={{ x: -0.7, y: 0 }}
        end={{ x: 1, y: 1.1 }}
        style={styles.container}
      >
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
          //onPress={() => navigation.navigate("Tips")}
        >
          <View style={{ flex: 1 }}>
            <FontAwesome5 name="heartbeat" size={66} color="#ff0051" />
          </View>
          <TouchableOpacity
            style={styles.measureButton}
            onPress={() => navigation.navigate("Monitoring")}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 16,
                paddingBottom: 3,
              }}
            >
              Measure now
            </Text>
            <Image
              source={arrow}
              style={{ tintColor: "white", width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </LinearGradient>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#1a1a1a",
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
  measureButton: {
    backgroundColor: "#ff0051",
    width: 170,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
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
