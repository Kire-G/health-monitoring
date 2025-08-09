package com.health_monitoring_systems.dto;

import lombok.Data;

@Data
public class EmailRequest {
    private String from; // User's email for reply-to
    private String fromName; // User's name for the 'from' field
    private String to; // Doctor's email
    private String subject;
    private String body;
}
