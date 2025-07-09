package com.health_monitoring_systems.service;

import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.model.UserMeasurements;
import com.health_monitoring_systems.repository.UserMeasurementsRepository;
import com.health_monitoring_systems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public void saveMeasurement(UserMeasurements measurement) {
        // опционално: проверка дали юзъра съществува
        Long userId = measurement.getUser().getId();
        Optional<User> user = userRepository.findById(userId);

        if (user.isEmpty()) {
            throw new RuntimeException("User with ID " + userId + " not found");
        }

        measurement.setUser(user.get());
        measurementsRepository.save(measurement);
    }

    public void deleteMeasurement(Long id) {
        measurementsRepository.deleteById(id);
    }
}
