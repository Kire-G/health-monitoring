package com.health_monitoring_systems.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Integer age;
    private String password;
    private String email;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference("user-measurements")
    private List<UserMeasurements> userMeasurements;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference("user-details")
    private UserDetails userDetails;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-doctor-details")
    private DoctorDetails doctorDetails;
}
