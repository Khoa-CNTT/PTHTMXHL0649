package com.LinkVerse.identity.service.chat;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GiphyService {

    String giphyApiKey = "sbkPyTQSXMX4q1T9SkFWuWY8yILpjM5d";

    RestTemplate restTemplate = new RestTemplate();

    public List<String> getTrendingStickers(int limit) {
        String url = UriComponentsBuilder.fromHttpUrl("https://api.giphy.com/v1/stickers/trending")
                .queryParam("api_key", giphyApiKey)
                .queryParam("limit", limit)
                .queryParam("rating", "g")
                .toUriString();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        List<Map<String, Object>> data =
                (List<Map<String, Object>>) response.getBody().get("data");

        return data.stream()
                .map(d -> ((Map<String, Object>) ((Map<String, Object>) d.get("images")).get("original"))
                        .get("url")
                        .toString())
                .collect(Collectors.toList());
    }

    public List<String> searchStickers(String keyword, int limit) {
        String url = UriComponentsBuilder.fromHttpUrl("https://api.giphy.com/v1/stickers/search")
                .queryParam("api_key", giphyApiKey)
                .queryParam("q", keyword)
                .queryParam("limit", limit)
                .queryParam("rating", "g")
                .toUriString();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        List<Map<String, Object>> data =
                (List<Map<String, Object>>) response.getBody().get("data");

        return data.stream()
                .map(d -> ((Map<String, Object>) ((Map<String, Object>) d.get("images")).get("original"))
                        .get("url")
                        .toString())
                .collect(Collectors.toList());
    }

    public List<String> getEmojis(int limit) {
        String url = UriComponentsBuilder.fromHttpUrl("https://api.giphy.com/v2/emoji")
                .queryParam("api_key", giphyApiKey)
                .queryParam("limit", limit)
                .toUriString();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        List<Map<String, Object>> data =
                (List<Map<String, Object>>) response.getBody().get("data");

        return data.stream().map(d -> d.get("url").toString()).collect(Collectors.toList());
    }
}
