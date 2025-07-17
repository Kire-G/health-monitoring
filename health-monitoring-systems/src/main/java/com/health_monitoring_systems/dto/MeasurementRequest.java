package com.health_monitoring_systems.dto;

import lombok.Data;

@Data
public class MeasurementRequest {
    private String userEmail;
    private double temperature;
    private int heartRate;
    private int oxygen;
    private double humidity;
    private double roomTemperature;
}
