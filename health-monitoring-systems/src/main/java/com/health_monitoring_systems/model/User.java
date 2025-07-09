package com.health_monitoring_systems.model;

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
    private List<UserMeasurements> userMeasurementsHistory;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserDetails userDetails;
}
