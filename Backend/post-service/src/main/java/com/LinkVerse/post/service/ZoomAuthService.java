//package com.LinkVerse.post.service;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpEntity;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.Base64;
//import java.util.Map;
//
//@Service
//public class ZoomAuthService {
//
//    @Value("${zoom.client.id}")
//    private String clientId;
//
//    @Value("${zoom.client.secret}")
//    private String clientSecret;
//
//    public String getAccessToken() {
//        String url = "https://zoom.us/oauth/token";
//        String auth = clientId + ":" + clientSecret;
//        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Authorization", "Basic " + encodedAuth);
//        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//
//        HttpEntity<String> request = new HttpEntity<>("grant_type=client_credentials", headers);
//
//        RestTemplate restTemplate = new RestTemplate();
//        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
//
//        return (String) response.getBody().get("9m03sJibS7eOny0CZaPj3Q");
//    }
//}