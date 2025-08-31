package com.health_monitoring_systems.dto;

import lombok.Data;

@Data
public class EmailRequest {
    private String from;
    private String fromName;
    private String to;
    private String subject;
    private String body;
}
