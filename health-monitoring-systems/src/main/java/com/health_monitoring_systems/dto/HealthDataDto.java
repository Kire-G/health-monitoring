package com.health_monitoring_systems.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class HealthDataDto {
    private double temperature;
    private double roomTemperature;
    private double humidity;
    private int heartRate;
    private double oxygen;
    private String dateOfMeasurement;

    // Getters and Setters
    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getRoomTemperature() {
        return roomTemperature;
    }

    public void setRoomTemperature(double roomTemperature) {
        this.roomTemperature = roomTemperature;
    }

    public double getHumidity() {
        return humidity;
    }

    public void setHumidity(double humidity) {
        this.humidity = humidity;
    }

    public int getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(int heartRate) {
        this.heartRate = heartRate;
    }

    public double getOxygen() {
        return oxygen;
    }

    public void setOxygen(double oxygen) {
        this.oxygen = oxygen;
    }

    public String getDateOfMeasurement() {
        return dateOfMeasurement;
    }

    public void setDateOfMeasurement(String dateOfMeasurement) {
        this.dateOfMeasurement = dateOfMeasurement;
    }
}
