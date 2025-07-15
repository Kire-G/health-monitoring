import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  FlatList,
} from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const tips = [
  {
    title: "Stay Hydrated",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
    url: "https://www.healthline.com/nutrition/how-much-water-should-you-drink-per-day",
  },
  {
    title: "Balanced Diet",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80",
    url: "https://www.choosemyplate.gov/eathealthy/what-is-myplate",
  },
  {
    title: "Regular Exercise",
    image:
      "https://images.unsplash.com/photo-1554284126-682ce1c3b54a?auto=format&fit=crop&w=300&q=80",
    url: "https://www.cdc.gov/physicalactivity/basics/index.htm",
  },
  {
    title: "Sleep Well",
    image:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=300&q=80",
    url: "https://www.sleepfoundation.org/",
  },
  {
    title: "Mindfulness",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80",
    url: "https://www.headspace.com/mindfulness",
  },
];

const allWorkouts = [
  {
    title: "Morning Yoga",
    image:
      "https://images.unsplash.com/photo-1554284126-682ce1c3b54a?auto=format&fit=crop&w=300&q=80",
    url: "https://www.yogajournal.com/practice/20-minute-morning-yoga-flow",
  },
  {
    title: "HIIT Workout",
    image:
      "https://images.unsplash.com/photo-1518611012118-f80e9f9c7e3f?auto=format&fit=crop&w=300&q=80",
    url: "https://www.self.com/gallery/hiit-workouts-for-all-levels",
  },
  {
    title: "Stretching Routine",
    image:
      "https://images.unsplash.com/photo-1546484959-f0f3db88a1fa?auto=format&fit=crop&w=300&q=80",
    url: "https://www.healthline.com/health/fitness-exercise/stretching-exercises",
  },
  {
    title: "Cardio Burn",
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=300&q=80",
    url: "https://www.fitnessblender.com/videos/cardio-workout",
  },
  {
    title: "Core Strength",
    image:
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=300&q=80",
    url: "https://darebee.com/workouts/core-workout.html",
  },
  {
    title: "Full Body Blast",
    image:
      "https://images.unsplash.com/photo-1609873747550-6d18027e951c?auto=format&fit=crop&w=300&q=80",
    url: "https://www.menshealth.com/fitness/a32134178/full-body-home-workout/",
  },
];

const challenges = [
  {
    title: "10,000 Steps Challenge",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
    url: "https://www.healthline.com/health/fitness-exercise/how-many-steps-a-day",
  },
  {
    title: "No Sugar for a Day",
    image:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=300&q=80",
    url: "https://www.healthline.com/nutrition/hidden-sugar",
  },
  {
    title: "Meditate 5 Minutes",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
    url: "https://www.headspace.com/meditation/meditation-for-beginners",
  },
  {
    title: "No Screens 1 Hour Before Bed",
    image:
      "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?auto=format&fit=crop&w=300&q=80",
    url: "https://www.sleepfoundation.org/",
  },
  {
    title: "Gratitude Journaling",
    image:
      "https://images.unsplash.com/photo-1581090700227-1e8e8f3b7dba?auto=format&fit=crop&w=300&q=80",
    url: "https://positivepsychology.com/gratitude-journal/",
  },
];

export default function Home() {
  const { user } = useAppContext();
  const navigation = useNavigation<any>();
  const [dailyWorkouts, setDailyWorkouts] = useState([]);

  // Helper: Rotate based on date
  const getDailyWorkout = () => {
    const dateSeed = new Date().toISOString().split("T")[0]; // e.g., "2025-07-14"
    const hash =
      Array.from(dateSeed).reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      allWorkouts.length;

    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(allWorkouts[(hash + i) % allWorkouts.length]);
    }
    return result;
  };

  useEffect(() => {
    const todays = getDailyWorkout();
    setDailyWorkouts(todays);
    AsyncStorage.setItem("lastWorkoutShown", JSON.stringify(todays));
  }, []);

  const renderItem = (item: { title: string; image: string; url: string }) => (
    <TouchableOpacity
      key={item.title}
      style={styles.tipCard}
      onPress={() => Linking.openURL(item.url)}
    >
      <Image source={{ uri: item.image }} style={styles.tipImage} />
      <Text style={styles.tipTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: any[]) => (
    <>
      <Text style={styles.sectionHeader}>{title}</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.title}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </>
  );

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

        {renderSection("Health Tips", tips)}
        {renderSection("Daily Workouts", dailyWorkouts)}
        {renderSection("Daily Challenges", challenges)}
      </ScrollView>
    </LinearGradient>
  );
}

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
  sectionHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    marginTop: 10,
  },
  tipCard: {
    backgroundColor: "#2a2a3d",
    width: 150,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    alignItems: "center",
  },
  tipImage: {
    width: 130,
    height: 130,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});
