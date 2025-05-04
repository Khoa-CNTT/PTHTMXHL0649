package com.LinkVerse.post.service;

import com.LinkVerse.post.entity.Keyword;
import com.LinkVerse.post.repository.KeywordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.DetectDominantLanguageRequest;
import software.amazon.awssdk.services.comprehend.model.DetectDominantLanguageResponse;
import software.amazon.awssdk.services.comprehend.model.DetectKeyPhrasesRequest;
import software.amazon.awssdk.services.comprehend.model.DetectKeyPhrasesResponse;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeywordService {
    private final ComprehendClient comprehendClient;
    private final KeywordRepository keywordRepository;

    private static final Set<String> SUPPORTED_LANGUAGES = new HashSet<>(List.of(
            "hi", "de", "zh-TW", "ko", "pt", "en", "it", "fr", "zh", "es", "ar", "ja"));

    public List<Keyword> extractAndSaveKeyPhrases(String content, String contentId) {
        try {
            String languageCode = detectDominantLanguage(content);
            log.info("Detected language code: {}", languageCode);

            if (!SUPPORTED_LANGUAGES.contains(languageCode)) {
                log.warn("Language '{}' is not supported for keyword extraction.", languageCode);
                return List.of(); // Return an empty list or handle as needed
            }

            DetectKeyPhrasesRequest request = DetectKeyPhrasesRequest.builder()
                    .text(content)
                    .languageCode(languageCode)
                    .build();

            DetectKeyPhrasesResponse response = comprehendClient.detectKeyPhrases(request);

            List<String> phrases = response.keyPhrases().stream()
                    .map(keyPhrase -> keyPhrase.text())
                    .collect(Collectors.toList());

            List<Keyword> keyPhraseKeywords = new ArrayList<>();
            for (String phrase : phrases) {
                Keyword keyword = keywordRepository.findByPhraseIn(List.of(phrase)).stream().findFirst()
                        .orElseGet(() -> Keyword.builder()
                                .phrase(phrase)
                                .usageCount(0)
                                .linkedContentIds(new ArrayList<>())
                                .build());

                log.info("Saving keyword: {}", keyword);

                keyword.setUsageCount(keyword.getUsageCount() + 1);
                keyword.getLinkedContentIds().add(contentId);
                keyPhraseKeywords.add(keywordRepository.save(keyword));
            }

            return keyPhraseKeywords;
        } catch (Exception e) {
            log.error("Error extracting keywords: ", e);
            return List.of();
        }
    }

    public String detectDominantLanguage(String content) {
        try {
            DetectDominantLanguageRequest request = DetectDominantLanguageRequest.builder()
                    .text(content)
                    .build();

            DetectDominantLanguageResponse response = comprehendClient.detectDominantLanguage(request);
            log.info("Detected languages: {}", response.languages());

            return response.languages().get(0).languageCode();
        } catch (Exception e) {
            log.error("Error detecting dominant language: ", e);
            return "en";
        }
    }

    public List<String> getKeywordIdsFromPhrase(String phrase) {
        List<Keyword> keywords = keywordRepository.findByPhraseIn(List.of(phrase));
        return keywords.stream().map(Keyword::getId).collect(Collectors.toList());
    }
}