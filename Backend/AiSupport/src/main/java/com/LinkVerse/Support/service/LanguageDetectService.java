package com.LinkVerse.Support.service;

import com.github.pemistahl.lingua.api.Language;
import com.github.pemistahl.lingua.api.LanguageDetector;
import com.github.pemistahl.lingua.api.LanguageDetectorBuilder;
import org.springframework.stereotype.Service;

@Service
public class LanguageDetectService {

    private final LanguageDetector detector = LanguageDetectorBuilder.fromAllLanguages().build();

    public String detectLanguage(String text) {
        Language lang = detector.detectLanguageOf(text);
        return lang.getIsoCode639_1().toString();
    }
}

