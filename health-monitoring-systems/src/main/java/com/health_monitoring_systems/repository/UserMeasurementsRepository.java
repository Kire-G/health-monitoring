package com.health_monitoring_systems.repository;

import com.health_monitoring_systems.model.UserMeasurements;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserMeasurementsRepository extends JpaRepository<UserMeasurements, Long> {
    List<UserMeasurements> findByUserId(Long userId);
    List<UserMeasurements> findByUserEmail(String email);
}
