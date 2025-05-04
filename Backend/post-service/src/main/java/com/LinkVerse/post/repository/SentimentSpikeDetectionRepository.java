package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.time.Instant;

@EnableMongoRepositories
public interface SentimentSpikeDetectionRepository extends MongoRepository<Post, Long> {

    @Query(value = "{ 'createdDate': { $gte: ?0, $lte: ?1 }, 'sentiment': 'NEGATIVE' }", count = true)
    Long countNegativePostsInTimeRange(Instant start, Instant end);

    @Query(value = "{ 'createdDate': { $gte: ?0, $lte: ?1 } }", count = true)
    long countTotalPostsInTimeRange(Instant start, Instant end);
}