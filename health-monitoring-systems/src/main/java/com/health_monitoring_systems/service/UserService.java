package com.health_monitoring_systems.service;

import com.health_monitoring_systems.model.SensorData;
import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.repository.UserMeasurementsRepository;
import com.health_monitoring_systems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService{
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository, UserMeasurementsRepository userMeasurementsRepository) {
        this.userRepository = userRepository;
    }

    public User login (String email, String password){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User with email: " + email + " not found!"));
        if(!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Wrong credentials");
        }

        return user;
    }

    public void saveUser(User user){
        userRepository.save(user);
    }


}
