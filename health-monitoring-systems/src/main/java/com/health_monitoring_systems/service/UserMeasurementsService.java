package com.health_monitoring_systems.service;

import com.health_monitoring_systems.dto.MeasurementRequest;
import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.model.UserMeasurements;
import com.health_monitoring_systems.repository.UserMeasurementsRepository;
import com.health_monitoring_systems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserMeasurementsService {

    private final UserMeasurementsRepository measurementsRepository;
    private final UserRepository userRepository;

    public List<UserMeasurements> getAllByUserEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User with this email: " + email + " doesn't exists!"));
        return user.getUserMeasurementsHistory();
    }

    public UserMeasurements getMeasurement(Long id) {
        return measurementsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Measurement not found"));
    }

    public List<UserMeasurements> getMeasurementsByUser(Long userId) {
        return measurementsRepository.findByUserId(userId);
    }

    public void saveMeasurement(MeasurementRequest measurementRequest) {
        User user = userRepository.findByEmail(measurementRequest.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User with email " + measurementRequest.getUserEmail() + " not found"));

        UserMeasurements measurement = new UserMeasurements();
        measurement.setUser(user);
        measurement.setTemperature(measurementRequest.getTemperature());
        measurement.setHeartRate(measurementRequest.getHeartRate());
        measurement.setOxygen(measurementRequest.getOxygen());
        measurement.setHumidity(measurementRequest.getHumidity());
        measurement.setRoomTemperature(measurementRequest.getRoomTemperature());
        measurement.setDateOfMeasurement(LocalDateTime.now());

        measurementsRepository.save(measurement);
    }

    public void deleteMeasurement(Long id) {
        measurementsRepository.deleteById(id);
    }
}
