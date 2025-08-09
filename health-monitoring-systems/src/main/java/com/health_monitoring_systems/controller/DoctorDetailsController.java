package com.health_monitoring_systems.controller;

import com.health_monitoring_systems.model.DoctorDetails;
import com.health_monitoring_systems.service.DoctorDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/{userId}/doctor-details")
public class DoctorDetailsController {

    private final DoctorDetailsService doctorDetailsService;

    @Autowired
    public DoctorDetailsController(DoctorDetailsService doctorDetailsService) {
        this.doctorDetailsService = doctorDetailsService;
    }

    @PutMapping
    public ResponseEntity<DoctorDetails> updateDoctorDetails(@PathVariable Long userId, @RequestBody DoctorDetails doctorDetails) {
        DoctorDetails updatedDoctorDetails = doctorDetailsService.updateDoctorDetails(userId, doctorDetails);
        return ResponseEntity.ok(updatedDoctorDetails);
    }
}
