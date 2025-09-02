package com.health_monitoring_systems.service;

import com.health_monitoring_systems.exception.UserNotFoundException;
import com.health_monitoring_systems.model.DoctorDetails;
import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.model.UserDetails;

import com.health_monitoring_systems.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final DoctorDetailsService doctorDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, DoctorDetailsService doctorDetailsService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorDetailsService = doctorDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        if (user.getUserDetails() == null) {
            UserDetails userDetails = new UserDetails();
            userDetails.setUser(user);
            user.setUserDetails(userDetails);
            userRepository.save(user);
        }
        return user;
    }

    public User login (String email, String password){
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User with email: " + email + " not found!"));
            if(!passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("Wrong credentials");
            }
            return getUserById(user.getId());
        } catch (Exception e) {
            logger.error("Login failed for email: {}. Root cause: ", email, e);
            throw e;
        }
    }

    public void saveUser(User user){
        // Hash password before saving for security
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        user.setName(userDetails.getName());
        user.setAge(userDetails.getAge());
        user.setEmail(userDetails.getEmail());

        if (userDetails.getUserDetails() != null) {
            UserDetails existingDetails = user.getUserDetails();
            if (existingDetails == null) {
                existingDetails = new UserDetails();
                user.setUserDetails(existingDetails);
                existingDetails.setUser(user);
            }
            UserDetails newDetails = userDetails.getUserDetails();
            existingDetails.setHeight(newDetails.getHeight());
            existingDetails.setWeight(newDetails.getWeight());
            existingDetails.setGender(newDetails.getGender());
        }

        // Save user first
        User savedUser = userRepository.save(user);

        // Handle doctor assignment if doctor details are provided
        if (userDetails.getDoctor() != null) {
            doctorDetailsService.assignDoctorToUser(id, userDetails.getDoctor());
            // Fetch updated user with doctor information
            savedUser = userRepository.findById(id).orElse(savedUser);
        }

        return savedUser;
    }


}
