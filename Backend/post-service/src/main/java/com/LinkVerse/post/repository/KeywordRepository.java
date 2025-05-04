package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Keyword;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.List;

@EnableMongoRepositories
public interface KeywordRepository extends MongoRepository<Keyword, String> {
    List<Keyword> findByPhraseIn(List<String> phrases);

}
