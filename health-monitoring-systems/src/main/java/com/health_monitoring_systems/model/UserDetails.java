package com.health_monitoring_systems.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Boolean smoker;
    private Double height;
    private Double weight;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
