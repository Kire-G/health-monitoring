package com.health_monitoring_systems.service;

import com.health_monitoring_systems.model.SensorData;
import org.springframework.stereotype.Service;

@Service
public class DataService {
    private final SensorData data = new SensorData();

    public SensorData getSensorDataFromArduino(SensorData sensorData){
        data.setBpm(sensorData.getBpm());
        data.setTemperature(sensorData.getTemperature());
        data.setBodyTemperature(sensorData.getBodyTemperature());
        data.setSpo2(sensorData.getSpo2());
        data.setHumidity(sensorData.getHumidity());

        return sensorData;
    }
    public SensorData getSensorData() {
        if(data.getBpm() < 60) {
            data.setBpm(0);
        }
        return data;
    }
}
