package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.AnonymousQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnonymousQuestionRepository extends MongoRepository<AnonymousQuestion, String> {
}