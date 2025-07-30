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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { USER_MEASUREMENTS } from "@/config/axiosConfig";
import HealthData from "@/constants/HealthData";
import { API_NINJAS_EXERCISE_API_KEY } from "../env";

// Define types for workout and recipe for clarity
interface Workout {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

interface Recipe {
  id: string;
  title: string;
  url: string | null;
  image: string | null; // Add image property
}

// Helper function to get an icon for a given muscle group
const getWorkoutIcon = (muscle: string) => {
  switch (muscle.toLowerCase()) {
    case "biceps":
    case "forearms":
      return "dumbbell";
    case "chest":
    case "triceps":
      return "user-plus"; // A generic person icon
    case "lats":
    case "lower_back":
    case "middle_back":
      return "running"; // Represents back/body strength
    case "neck":
      return "child"; // Represents posture/neck alignment
    case "quadriceps":
    case "hamstrings":
    case "calves":
      return "walking"; // Leg-focused
    case "cardio":
      return "heartbeat";
    default:
      return "running"; // A default for other muscles
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
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  // Fetch health data
  useEffect(() => {
    const getMeasurements = async () => {
      if (!user?.email) return;
      try {
        const response = await axios.get(`${USER_MEASUREMENTS}/all-by-user`, {
          params: { email: user.email },
        });
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

  // Fetch workouts and instructions from API Ninjas
  useEffect(() => {
    const getWorkouts = async () => {
      if (!lastMeasurement) return;

      // Map health data to muscle groups for API Ninjas
      let muscle = "chest"; // Default
      if (lastMeasurement.temperature > 37.5) {
        muscle = "neck";
      } else if (lastMeasurement.heartRate > 100) {
        muscle = "lower_back"; // Calming, posture-focused
      } else if (lastMeasurement.oxygen < 95) {
        // For cardio, we will fetch a cardio exercise by name as the API is muscle-focused
        muscle = ""; // Clear muscle to search by name
      }

      try {
        let apiUrl = `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`;
        if (muscle === "") {
          // If cardio is needed, search for a cardio exercise by name
          apiUrl = `https://api.api-ninjas.com/v1/exercises?name=jogging`;
        }

        const response = await axios.get(apiUrl, {

            headers: {
              "X-Api-Key": API_NINJAS_EXERCISE_API_KEY,
            },
          }
        );
        // API Ninjas returns up to 10 random exercises, so we just take the first 5
        setRecommendedWorkouts(response.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching workouts from API Ninjas:", error);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    if (lastMeasurement) {
      getWorkouts();
    }
  }, [lastMeasurement]);

  // Fetch recipes from TheMealDB API
  useEffect(() => {
    const getRecipes = async () => {
      if (!lastMeasurement) return;
      setLoadingRecipes(true);

      // More detailed logic to choose ingredients based on health data
      const ingredients: string[] = [];
      if (lastMeasurement.temperature > 37.5) {
        ingredients.push("Chicken", "Lemon"); // Soups and hydrating foods
      } else if (lastMeasurement.heartRate > 100) {
        ingredients.push("Oats", "Banana", "Berries"); // Heart-healthy foods
      } else if (lastMeasurement.oxygen < 95) {
        ingredients.push("Spinach", "Lentils", "Beef"); // Iron-rich foods
      } else {
        // Default healthy options
        ingredients.push("Chicken", "Broccoli", "Quinoa");
      }

      try {
        // 1. Fetch meals for each recommended ingredient
        const mealPromises = ingredients.map((ingredient) =>
          axios.get(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
          )
        );
        const mealResponses = await Promise.all(mealPromises);

        let allMeals: any[] = [];
        mealResponses.forEach((response) => {
          if (response.data.meals) {
            allMeals = [...allMeals, ...response.data.meals];
          }
        });

        // Remove duplicates and shuffle
        const uniqueMeals = Array.from(
          new Set(allMeals.map((m) => m.idMeal))
        ).map((id) => {
          return allMeals.find((m) => m.idMeal === id);
        });
        const randomMeals = uniqueMeals
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        if (randomMeals.length > 0) {
          // 2. Get details for the selected meals
          const recipePromises = randomMeals.map((meal: any) =>
            axios.get(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
            )
          );

          const recipeResponses = await Promise.all(recipePromises);

          const fetchedRecipes = recipeResponses
            .map((res) => {
              const mealDetails = res.data.meals[0];
              return {
                id: mealDetails.idMeal,
                title: mealDetails.strMeal,
                url: mealDetails.strSource,
                image: mealDetails.strMealThumb, // Get the thumbnail image
              };
            })
            .filter((r) => r.url); // Ensure we only process recipes with a URL

          // Validate URLs in parallel to ensure they are reachable
          const validatedRecipes: Recipe[] = [];
          const validationPromises = fetchedRecipes.map(async (recipe) => {
            try {
              await axios.head(recipe.url!);
              return true; // URL is reachable
            } catch (error) {
              console.warn(`Filtering out unreachable URL: ${recipe.url}`);
              return false; // URL is not reachable
            }
          });

          const results = await Promise.all(validationPromises);
          const finalRecipes = fetchedRecipes.filter(
            (_, index) => results[index]
          );

          setRecommendedRecipes(finalRecipes);
        } else {
          setRecommendedRecipes([]);
        }
      } catch (error) {
        console.error("Error fetching recipes from TheMealDB:", error);
        setRecommendedRecipes([]);
      } finally {
        setLoadingRecipes(false);
      }
    };

    if (lastMeasurement) {
      getRecipes();
    }
  }, [lastMeasurement]);

  if (loadingWorkouts || loadingRecipes) {
    return (
      <LinearGradient
        colors={["#050505", "#1c1c1c", "#2a2a3d"]}
        style={styles.fullScreen}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8A84FF" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Finding recommendations for you...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#050505", "#1c1c1c", "#2a2a3d"]}
      style={styles.fullScreen}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Your Personalized Plan</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Recommendations</Text>
          {recommendedWorkouts.length > 0 ? (
            recommendedWorkouts.map((workout) => (
              <TouchableOpacity
                key={workout.name}
                style={styles.card}
                onPress={() => setSelectedWorkout(workout)}
              >
                <FontAwesome5
                  name={getWorkoutIcon(workout.muscle)}
                  size={30}
                  color="#8A84FF"
                  style={styles.icon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{workout.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    Muscle: {workout.muscle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.infoText}>
              No workout recommendations available at this time.
            </Text>
          )}
        </View>

        {/* Placeholder for Recipes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipe Recommendations</Text>
          {recommendedRecipes.length > 0 ? (
            recommendedRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => recipe.url && Linking.openURL(recipe.url)}
              >
                {recipe.image && (
                  <Image source={{ uri: recipe.image }} style={styles.cardImage} />
                )}
                <View style={{ flex: 1, marginLeft: recipe.image ? 15 : 0 }}>
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
      </ScrollView>

      {/* Modal to display workout instructions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedWorkout !== null}
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
            <ScrollView style={styles.instructionsScrollView}>
              <Text style={styles.instructionsText}>
                {selectedWorkout?.instructions}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedWorkout(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    paddingTop: 60, // Increased top padding
    paddingHorizontal: 20,
    paddingBottom: 40, // Keep bottom padding
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF", // White text for better contrast on dark background
    backgroundColor: "rgba(57, 56, 81, 0.8)", // Matching card background
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25, // Rounded corners
    textAlign: "center",
    overflow: "hidden", // Ensures background respects border radius
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#393851", // Dark, theme-consistent background
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FFFFFF", // White text for dark background
  },
  instructionsScrollView: {
    width: "100%",
    marginBottom: 15,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 26, // Increased for better readability
    color: "#E0E0E0", // Light grey for readability
    textAlign: "justify", // Justified text for a clean, block look
  },
  closeButton: {
    backgroundColor: "#FF6347",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  card: {
    backgroundColor: "rgba(57, 56, 81, 0.8)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(138, 132, 255, 0.5)",
    flexDirection: "row",
    alignItems: "center",
  },
  videoButton: {
    backgroundColor: "#8A84FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  icon: {
    marginRight: 20,
    width: 30,
    textAlign: 'center',
  },
  videoButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 5,
  },
  infoText: {
    color: "#ccc",
    fontSize: 16,
  },
});

export default Personalized;
