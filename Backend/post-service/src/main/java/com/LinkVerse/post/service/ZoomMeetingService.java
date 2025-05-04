//package com.LinkVerse.post.service;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpEntity;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.Map;
//
//@Service
//public class ZoomMeetingService {
//
//    @Autowired
//    private ZoomAuthService zoomAuthService;
//
//    public String createMeeting(String userId, String topic, String startTime, int duration, String agenda) {
//        String accessToken = zoomAuthService.getAccessToken();
//        String url = "https://api.zoom.us/v2/users/" + userId + "/meetings";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Authorization", "Bearer " + accessToken);
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        String body = String.format(
//                "{\"topic\": \"%s\", \"type\": 2, \"start_time\": \"%s\", \"duration\": %d, \"timezone\": \"UTC\", \"agenda\": \"%s\", \"settings\": {\"host_video\": true, \"participant_video\": true}}",
//                topic, startTime, duration, agenda
//        );
//
//        HttpEntity<String> request = new HttpEntity<>(body, headers);
//
//        RestTemplate restTemplate = new RestTemplate();
//        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
//
//        Map<String, Object> responseBody = response.getBody();
//        return (String) responseBody.get("join_url");
//    }
//}