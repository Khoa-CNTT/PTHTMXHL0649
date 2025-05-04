package com.LinkVerse.post.repository;

import com.LinkVerse.post.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@EnableMongoRepositories
public interface CommentRespository extends MongoRepository<Comment, String> {
    Page<Comment> findAllByUserId(String userId, Pageable pageable);

    Page<Comment> findAllByContent(String content, Pageable pageable);
    //phương thức tùy chỉnh (custom query method).
    // Spring Data MongoDB sẽ tự động tạo ra truy vấn cho bạn dựa trên tên của phương thức.
    //Share post
}
