package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Hashtag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HashtagRepository extends MongoRepository<Hashtag, String> {
    Hashtag findByName(String name);
}