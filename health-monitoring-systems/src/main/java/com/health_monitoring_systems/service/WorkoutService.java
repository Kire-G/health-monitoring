package com.health_monitoring_systems.service;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    private static final OkHttpClient client = new OkHttpClient();

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    public String getRecommendedWorkouts(int age, String gender, double heartRate) throws IOException {
        List<String> bodyParts = new ArrayList<>();

        if (heartRate > 100) {
            bodyParts.add("cardio");
        } else if (age > 50) {
            bodyParts.add("back");
            bodyParts.add("waist");
        } else if (gender.equalsIgnoreCase("Male")) {
            bodyParts.add("shoulders");
            bodyParts.add("chest");
            bodyParts.add("upper arms");
        } else if (gender.equalsIgnoreCase("Female")) {
            bodyParts.add("glutes");
            bodyParts.add("upper legs");
            bodyParts.add("waist");
        } else {
            return fetchExercises("https://exercisedb.p.rapidapi.com/exercises");
        }

        List<Map<String, Object>> selectedExercises = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();

        for (String part : bodyParts) {
            String url = "https://exercisedb.p.rapidapi.com/exercises/bodyPart/" + part;
            String jsonResponse = fetchExercises(url);
            List<Map<String, Object>> exercisesForPart = mapper.readValue(jsonResponse, new TypeReference<List<Map<String, Object>>>(){});

            Map<String, List<Map<String, Object>>> groupedByEquipment = exercisesForPart.stream()
                    .collect(Collectors.groupingBy(e -> (String) e.get("equipment")));

            addExercisesWithQuota(selectedExercises, groupedByEquipment.get("barbell"), 2);
            addExercisesWithQuota(selectedExercises, groupedByEquipment.get("dumbbell"), 2);
            addExercisesWithQuota(selectedExercises, groupedByEquipment.get("body weight"), 1);
            addExercisesWithQuota(selectedExercises, groupedByEquipment.get("cable"), 1);
        }

        Collections.shuffle(selectedExercises);

        try {
            return mapper.writeValueAsString(selectedExercises);
        } catch (IOException e) {
            throw new RuntimeException("Error serializing exercises to JSON", e);
        }
    }

    private void addExercisesWithQuota(List<Map<String, Object>> mainList, List<Map<String, Object>> sourceList, int quota) {
        if (sourceList == null || sourceList.isEmpty()) {
            return;
        }
        Collections.shuffle(sourceList);
        int limit = Math.min(sourceList.size(), quota);
        for (int i = 0; i < limit; i++) {
            mainList.add(sourceList.get(i));
        }
    }

    private String fetchExercises(String url) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("X-RapidAPI-Key", rapidApiKey)
                .addHeader("X-RapidAPI-Host", "exercisedb.p.rapidapi.com")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }
            return response.body().string();
        }
    }
}
