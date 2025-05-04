package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.List;

@EnableMongoRepositories
public interface PostRepository extends MongoRepository<Post, String> {

    Page<Post> findByVisibilityNot(PostVisibility visibility, Pageable pageable);

    Page<Post> findAllByUserId(String userId, Pageable pageable);

    Page<Post> findPostByUserId(String userId, Pageable pageable);


    Page<Post> findAllByLanguage(String language, Pageable pageable);

    Page<Post> findAll(Pageable pageable);


    Page<Post> findByKeywordsIn(List<String> keywordIds, Pageable pageable); // Use 'keywords' instead of 'keywordIds'


    Page<Post> findAllByPrimarySentiment(String primarySentiment, Pageable pageable);


    Page<Post> findAllBySavedBy(String currentUserId, Pageable pageable);

    Page<Post> findAllByContentContainingAndVisibility(String content, PostVisibility visibility, Pageable pageable);

    Page<Post> findAllByVisibility(PostVisibility visibility, Pageable pageable);

}