package com.health_monitoring_systems.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String officialFromEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendHealthReport(String from, String fromName, String to, String subject, String body) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Set the 'from' address to appear as the user, but it's sent via the official app email
            helper.setFrom(new InternetAddress(officialFromEmail, fromName));
            // Set the recipient (the doctor)
            helper.setTo(to);
            // Set the subject and body
            helper.setSubject(subject);
            helper.setText(body, false); // false indicates plain text
            // Set the 'reply-to' to be the user's actual email address
            helper.setReplyTo(from);

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.error("Failed to send email. Root cause: ", e);
            throw new RuntimeException("Failed to send email. Check server logs for details.", e);
        }
    }
}
