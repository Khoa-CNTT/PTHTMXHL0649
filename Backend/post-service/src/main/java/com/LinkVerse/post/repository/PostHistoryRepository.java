package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.PostHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@EnableMongoRepositories
public interface PostHistoryRepository extends MongoRepository<PostHistory, String> {
}