package com.health_monitoring_systems.repository;

import com.health_monitoring_systems.model.DoctorDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorDetailsRepository extends JpaRepository<DoctorDetails, Long> {
}
