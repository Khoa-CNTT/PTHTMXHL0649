package com.LinkVerse.post.repository;


import com.LinkVerse.post.entity.Story;
import com.LinkVerse.post.entity.StoryVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoryRepository extends MongoRepository<Story, String> {
    List<Story> findAllByUserIdAndExpiryTimeAfter(String userId, LocalDateTime currentTime);

    void deleteByExpiryTimeBefore(LocalDateTime currentTime);

    void deleteByPostedAtBefore(LocalDateTime time);

    List<Story> findAllByExpiryTimeAfterAndVisibilityOrUserIdAndExpiryTimeAfter(
            LocalDateTime expiryTime, StoryVisibility visibility, String userId, LocalDateTime expiryTimeAgain);

    Page<Story> findByUserId(String userId, Pageable pageable);
        Optional<Story> findByUserIdAndExpiryTimeAfter(String userId, LocalDateTime expiryTime);


}

