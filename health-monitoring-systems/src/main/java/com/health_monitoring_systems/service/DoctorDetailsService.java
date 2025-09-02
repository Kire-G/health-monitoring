package com.health_monitoring_systems.service;

import com.health_monitoring_systems.model.DoctorDetails;
import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.repository.DoctorDetailsRepository;
import com.health_monitoring_systems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DoctorDetailsService {

    private final DoctorDetailsRepository doctorDetailsRepository;
    private final UserRepository userRepository;

    @Autowired
    public DoctorDetailsService(DoctorDetailsRepository doctorDetailsRepository, UserRepository userRepository) {
        this.doctorDetailsRepository = doctorDetailsRepository;
        this.userRepository = userRepository;
    }

    public DoctorDetails assignDoctorToUser(Long userId, DoctorDetails doctorPayload) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // If payload is empty, unassign doctor
        boolean emptyPayload = doctorPayload == null || (
                (doctorPayload.getDoctorName() == null || doctorPayload.getDoctorName().trim().isEmpty()) &&
                (doctorPayload.getDoctorEmail() == null || doctorPayload.getDoctorEmail().trim().isEmpty()) &&
                (doctorPayload.getDoctorPhone() == null || doctorPayload.getDoctorPhone().trim().isEmpty())
        );
        if (emptyPayload) {
            user.setDoctor(null);
            userRepository.save(user);
            return null;
        }

        String email = doctorPayload.getDoctorEmail();
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Doctor email is required");
        }

        DoctorDetails existingDoctor = doctorDetailsRepository.findByDoctorEmail(email).orElse(null);
        
        if (existingDoctor != null) {
            // Doctor exists - validate that provided information matches database
            validateDoctorInformation(existingDoctor, doctorPayload);
            user.setDoctor(existingDoctor);
            userRepository.save(user);
            return existingDoctor;
        } else {
            // Doctor doesn't exist - create new one
            DoctorDetails newDoctor = new DoctorDetails();
            newDoctor.setDoctorName(doctorPayload.getDoctorName());
            newDoctor.setDoctorEmail(doctorPayload.getDoctorEmail());
            newDoctor.setDoctorPhone(doctorPayload.getDoctorPhone());
            newDoctor = doctorDetailsRepository.save(newDoctor);

            user.setDoctor(newDoctor);
            userRepository.save(user);
            return newDoctor;
        }
    }

    private void validateDoctorInformation(DoctorDetails existingDoctor, DoctorDetails providedDoctor) {
        // Check if name matches (if provided)
        if (providedDoctor.getDoctorName() != null && !providedDoctor.getDoctorName().trim().isEmpty()) {
            if (!existingDoctor.getDoctorName().equals(providedDoctor.getDoctorName())) {
                throw new RuntimeException("Doctor name does not match database records. Expected: " + 
                    existingDoctor.getDoctorName() + ", but got: " + providedDoctor.getDoctorName());
            }
        }

        // Check if phone matches (if provided)
        if (providedDoctor.getDoctorPhone() != null && !providedDoctor.getDoctorPhone().trim().isEmpty()) {
            if (existingDoctor.getDoctorPhone() != null && 
                !existingDoctor.getDoctorPhone().equals(providedDoctor.getDoctorPhone())) {
                throw new RuntimeException("Doctor phone does not match database records. Expected: " + 
                    existingDoctor.getDoctorPhone() + ", but got: " + providedDoctor.getDoctorPhone());
            }
        }
    }
}
