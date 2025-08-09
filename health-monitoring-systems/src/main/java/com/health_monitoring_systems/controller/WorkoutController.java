package com.health_monitoring_systems.controller;

import com.health_monitoring_systems.service.WorkoutService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping("/recommendations")
    public String getWorkoutRecommendations(@RequestParam int age,
                                            @RequestParam String gender,
                                            @RequestParam double heartRate) throws IOException {
        return workoutService.getRecommendedWorkouts(age, gender, heartRate);
    }
}
