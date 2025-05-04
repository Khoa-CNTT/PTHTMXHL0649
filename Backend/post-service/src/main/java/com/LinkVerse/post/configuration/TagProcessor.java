package com.LinkVerse.post.configuration;


import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class TagProcessor {

    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#(\\w+)");
    private static final Pattern MENTION_PATTERN = Pattern.compile("@(\\w+)");

    public Set<String> extractHashtags(String content) {
        return extractTags(content, HASHTAG_PATTERN);
    }

    public Set<String> extractMentions(String content) {
        return extractTags(content, MENTION_PATTERN);
    }

    private Set<String> extractTags(String content, Pattern pattern) {
        Set<String> tags = new HashSet<>();
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            tags.add(matcher.group(1));
        }
        return tags;
    }
}
