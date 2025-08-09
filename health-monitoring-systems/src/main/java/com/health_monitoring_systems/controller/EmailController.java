package com.health_monitoring_systems.controller;

import com.health_monitoring_systems.dto.EmailRequest;
import com.health_monitoring_systems.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:3000")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public void sendEmail(@RequestBody EmailRequest emailRequest) {
        emailService.sendHealthReport(
            emailRequest.getFrom(),
            emailRequest.getFromName(),
            emailRequest.getTo(),
            emailRequest.getSubject(),
            emailRequest.getBody()
        );
    }
}
