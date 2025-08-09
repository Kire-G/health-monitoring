package com.health_monitoring_systems.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-doctor-details")
    private User user;
}
