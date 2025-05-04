package com.LinkVerse.post.service;

import com.LinkVerse.post.dto.request.PsychologicalSupportRequest;
import com.LinkVerse.post.repository.client.NotificationClient;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@AllArgsConstructor
@Service
public class PsychologicalSupportService {

    @Autowired
//    private ZoomMeetingService zoomMeetingService;
    NotificationClient notificationClient;
    private final RestTemplate restTemplate;

//    public String requestSupport(String email) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String currentUserId = authentication.getName();

    /// /        String joinUrl = zoomMeetingService.createMeeting(currentUserId, "Psychological Support", "2025-01-10T10:00:00Z", 30, "Discuss your concerns");
//        notificationClient.sendSupportJoinUrl(email, joinUrl);
//        return joinUrl;
//    }
    public void connectToPsychologist() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        String apiUrl = "https://api.psychologicalsupport.com/connect";
        PsychologicalSupportRequest request = new PsychologicalSupportRequest(currentUserId);
        restTemplate.postForObject(apiUrl, request, Void.class);
    }
}