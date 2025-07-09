package com.health_monitoring_systems.controller;

import com.health_monitoring_systems.model.UserMeasurements;
import com.health_monitoring_systems.service.UserMeasurementsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/measurements")
public class UserMeasurementsController {

    private final UserMeasurementsService measurementsService;

    public UserMeasurementsController(UserMeasurementsService measurementsService) {
        this.measurementsService = measurementsService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserMeasurements> getMeasurement(@PathVariable Long id) {
        return ResponseEntity.ok(measurementsService.getMeasurement(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserMeasurements>> getMeasurementsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(measurementsService.getMeasurementsByUser(userId));
    }

    @GetMapping("/all-by-user")
    public ResponseEntity<List<UserMeasurements>> getMeasurementsByUserEmail(@RequestParam String email) {
        return ResponseEntity.ok(measurementsService.getAllByUserEmail(email));
    }

    @PostMapping("/")
    public void saveMeasurement(@RequestBody UserMeasurements measurement) {
        measurementsService.saveMeasurement(measurement);
    }

    @DeleteMapping("/{id}")
    public void deleteMeasurement(@PathVariable Long id) {
        measurementsService.deleteMeasurement(id);
    }
}
