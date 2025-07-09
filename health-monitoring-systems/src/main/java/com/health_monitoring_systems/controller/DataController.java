package com.health_monitoring_systems.controller;

import com.health_monitoring_systems.model.SensorData;
import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.service.DataService;
import com.health_monitoring_systems.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/data")
@AllArgsConstructor
public class DataController {

    private DataService dataService;

    @PostMapping
    public ResponseEntity<SensorData> receiveData(@RequestBody SensorData data) {
        return ResponseEntity.ok(dataService.getSensorDataFromArduino(data));
    }

    @GetMapping
    public ResponseEntity<SensorData> getData () {
        return ResponseEntity.ok(dataService.getSensorData());
    }
}
