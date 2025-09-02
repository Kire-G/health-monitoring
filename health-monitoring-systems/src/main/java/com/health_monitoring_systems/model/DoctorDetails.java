package com.health_monitoring_systems.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class DoctorDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String doctorName;
    private String doctorEmail;
    private String doctorPhone;

    // Optional: One doctor can have many users (patients)
    @OneToMany(mappedBy = "doctor")
    @JsonIgnore
    private List<User> patients = new ArrayList<>();
}
