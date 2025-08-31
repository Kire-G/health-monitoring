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

    public DoctorDetails updateDoctorDetails(Long userId, DoctorDetails doctorDetails) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        DoctorDetails existingDoctorDetails = user.getDoctorDetails();
        
        if (doctorDetails != null && 
            (doctorDetails.getDoctorName() == null || doctorDetails.getDoctorName().trim().isEmpty()) &&
            (doctorDetails.getDoctorEmail() == null || doctorDetails.getDoctorEmail().trim().isEmpty()) &&
            (doctorDetails.getDoctorPhone() == null || doctorDetails.getDoctorPhone().trim().isEmpty())) {
            
            if (existingDoctorDetails != null) {
                user.setDoctorDetails(null);
                doctorDetailsRepository.delete(existingDoctorDetails);
            }
            return null;
        }
        
        if (existingDoctorDetails == null) {
            existingDoctorDetails = new DoctorDetails();
            existingDoctorDetails.setUser(user);
            user.setDoctorDetails(existingDoctorDetails);
        }
        
        existingDoctorDetails.setDoctorName(doctorDetails.getDoctorName());
        existingDoctorDetails.setDoctorEmail(doctorDetails.getDoctorEmail());
        existingDoctorDetails.setDoctorPhone(doctorDetails.getDoctorPhone());
        return doctorDetailsRepository.save(existingDoctorDetails);
    }
}
