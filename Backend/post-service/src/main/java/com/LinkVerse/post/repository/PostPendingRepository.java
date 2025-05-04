package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.PostPending;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@EnableMongoRepositories
public interface PostPendingRepository extends MongoRepository<PostPending, String> {
    Page<PostPending> findByGroupId(String groupId, Pageable pageable);

}