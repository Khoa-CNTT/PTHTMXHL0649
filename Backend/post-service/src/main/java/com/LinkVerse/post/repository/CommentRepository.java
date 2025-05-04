package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentRepository extends MongoRepository<Comment, String> {
}