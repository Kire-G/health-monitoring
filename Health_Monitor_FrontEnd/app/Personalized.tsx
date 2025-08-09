import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Modal,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import axiosInstance from "@/config/axiosConfig";
import { USER_MEASUREMENTS } from "@/config/axiosConfig";
import HealthData from "@/constants/HealthData";

// Define types for workout and recipe for clarity
interface Workout {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  equipment: string;
  instructions: string[];
}

interface Recipe {
  id: string;
  title: string;
  url: string | null;
  image: string | null;
}

// Helper function to get an icon for a given muscle group
const getWorkoutIcon = (muscle: string) => {
  switch (muscle.toLowerCase()) {
    case "biceps":
    case "forearms":
      return "dumbbell";
    case "chest":
    case "triceps":
      return "user-plus";
    case "lats":
    case "lower_back":
    case "middle_back":
      return "running";
    case "neck":
      return "child";
    case "quadriceps":
    case "hamstrings":
    case "calves":
      return "walking";
    case "cardio":
      return "heartbeat";
    default:
      return "running";
  }
};

const Personalized = () => {
  const { user } = useAppContext();
  const [lastMeasurement, setLastMeasurement] = useState<HealthData | null>(
    null
  );
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<Workout[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const capitalizeFirstLetter = (string: string | undefined) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getWorkoutIcon = (target: string) => {
    const muscle = target.toLowerCase();
    // Cardio
    if (muscle.includes('cardio')) return 'heartbeat';
    // Legs
    if (['quads', 'glutes', 'legs', 'calves', 'hamstrings', 'abductors', 'adductors'].some(m => muscle.includes(m))) return 'running';
    // Arms
    if (['biceps', 'triceps', 'arms', 'forearms'].some(m => muscle.includes(m))) return 'dumbbell';
    // Back & Shoulders
    if (['lats', 'back', 'shoulders', 'delts', 'traps'].some(m => muscle.includes(m))) return 'weight-hanging';
    // Chest & Core
    if (['abs', 'pectorals', 'chest', 'waist', 'spine'].some(m => muscle.includes(m))) return 'fire';
    // Default
    return 'running';
  };

  // Fetch health data
  useEffect(() => {
    const getMeasurements = async () => {
      if (!user?.email) return;
      try {
        const response = await axiosInstance.get(
          `${USER_MEASUREMENTS}/all-by-user`,
          {
            params: { email: user.email },
          }
        );
        if (response.data && response.data.length > 0) {
          const sortedData = response.data.sort(
            (a: HealthData, b: HealthData) =>
              new Date(b.dateOfMeasurement).getTime() -
              new Date(a.dateOfMeasurement).getTime()
          );
          setLastMeasurement(sortedData[0]);
        }
      } catch (error) {
        console.error("Error fetching measurements:", error);
      }
    };

    getMeasurements();
  }, [user]);

  // Fetch recipes from TheMealDB API
  useEffect(() => {
    const getRecipes = async () => {
      if (!lastMeasurement) return;
      setLoadingRecipes(true);

      const ingredients: string[] = [];
      if (lastMeasurement.temperature > 37.5) {
        ingredients.push("Chicken", "Lemon");
      } else if (lastMeasurement.heartRate > 100) {
        ingredients.push("Oats", "Banana");
      } else if (lastMeasurement.oxygen < 95) {
        ingredients.push("Spinach", "Broccoli");
      } else {
        ingredients.push("Salmon", "Avocado");
      }

      try {
        const mealPromises = ingredients.map((ingredient) =>
          axiosInstance.get(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
          )
        );

        const mealResponses = await Promise.all(mealPromises);
        let meals: Recipe[] = [];
        mealResponses.forEach((response) => {
          if (response.data.meals) {
            const recipes = response.data.meals.map((meal: any) => ({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
              url: `https://www.themealdb.com/meal/${meal.idMeal}`,
            }));
            meals = [...meals, ...recipes];
          }
        });
        setRecommendedRecipes(meals);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    getRecipes();
  }, [lastMeasurement]);

  // Fetch workouts
  useEffect(() => {
    const getWorkouts = async () => {
      if (!user || !lastMeasurement) return;

      setLoadingWorkouts(true);
      try {
        const params = {
          age: user.age || 30, // Default age if not set
          gender: user.userDetails?.gender || 'Male',
          heartRate: lastMeasurement.heartRate,
        };

        const response = await axiosInstance.get(
          `/api/workouts/recommendations`,
          { params }
        );
        setRecommendedWorkouts(response.data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    if (user && lastMeasurement) {
      getWorkouts();
    }
  }, [user, lastMeasurement]);

  const renderListHeader = () => (
    <>
      <Text style={styles.header}>Personalized For You</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Recommendations</Text>
      </View>
    </>
  );

  const renderListFooter = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nutritional Suggestions</Text>
      {loadingRecipes ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : recommendedRecipes.length > 0 ? (
        recommendedRecipes.slice(0, 5).map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.card}
            onPress={() => recipe.url && Linking.openURL(recipe.url)}
          >
            <Image
              source={{ uri: recipe.image || undefined }}
              style={styles.cardImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{recipe.title}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.infoText}>
          No recipe recommendations available at this time.
        </Text>
      )}
    </View>
  );

  return (
    <LinearGradient colors={["#1E1E1E", "#121212"]} style={styles.fullScreen}>
      {loadingWorkouts ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          style={styles.container}
          data={recommendedWorkouts}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.workoutItem}
              onPress={() => setSelectedWorkout(item)}
            >
              <View style={styles.iconContainer}>
                <FontAwesome5
                  name={getWorkoutIcon(item.target)}
                  size={24}
                  color="#8A84FF"
                />
              </View>
              <Text style={styles.workoutName}>{capitalizeFirstLetter(item.name)}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={
            <Text style={styles.infoText}>
              No workout recommendations available. Please check back later!
            </Text>
          }
        />
      )}

      {/* Modal to display workout instructions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedWorkout !== null}
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{capitalizeFirstLetter(selectedWorkout?.name)}</Text>
            {selectedWorkout?.gifUrl && (
              <Image
                source={{ uri: selectedWorkout.gifUrl }}
                style={styles.workoutGif}
              />
            )}
            <Text style={styles.modalText}>
              Target: {selectedWorkout?.target}
            </Text>
            <Text style={styles.modalText}>
              Equipment: {selectedWorkout?.equipment}
            </Text>
            <ScrollView style={styles.instructionsScrollView}>
              <Text style={styles.instructionsText}>
                {Array.isArray(selectedWorkout?.instructions)
                  ? selectedWorkout.instructions.join("\n\n")
                  : selectedWorkout?.instructions}
              </Text>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.youtubeButton}
                onPress={() => {
                  if (selectedWorkout?.name) {
                    const query = encodeURIComponent(`${selectedWorkout.name} tutorial`);
                    const url = `https://www.youtube.com/results?search_query=${query}`;
                    Linking.openURL(url);
                  }
                }}
              >
                <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedWorkout(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  workoutItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 15,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  icon: {
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 2,
  },
  infoText: {
    color: "#CCCCCC",
    textAlign: "center",
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    padding: 20,
    width: "95%",
    alignItems: "center",
    elevation: 5,
    maxHeight: "95%",
    minHeight: "80%", // Ensure a minimum height
    borderColor: "#8A84FF",
    borderWidth: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  workoutGif: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#E0E0E0",
    lineHeight: 24,
    textTransform: "capitalize",
  },
  instructionsScrollView: {
    flex: 1, // Allow this to grow
    width: '100%',
    marginVertical: 15,
  },
  instructionsText: {
    fontSize: 16,
    color: "#E0E0E0",
    lineHeight: 24,
  },
  youtubeButton: {
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  youtubeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#8A84FF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});

export default Personalized;
