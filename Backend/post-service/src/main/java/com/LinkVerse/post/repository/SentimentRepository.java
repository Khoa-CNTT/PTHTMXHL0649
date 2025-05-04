package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Sentiment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@EnableMongoRepositories
public interface SentimentRepository extends MongoRepository<Sentiment, String> {
}