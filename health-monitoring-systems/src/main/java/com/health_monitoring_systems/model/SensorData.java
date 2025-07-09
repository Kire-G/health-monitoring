package com.health_monitoring_systems.model;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@ToString
@NoArgsConstructor
public class SensorData {
    public float temperature;
    public float humidity;
    public float bodyTemperature;
    public float bpm;
    public float spo2;
}