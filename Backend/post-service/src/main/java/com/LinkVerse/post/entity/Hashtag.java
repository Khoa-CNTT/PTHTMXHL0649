package com.LinkVerse.post.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Document(collection = "hashtags")
public class Hashtag {
    @Id
    private String id;
    private String name;
    private List<String> postIds;
    @DBRef
    private List<Post> posts = new ArrayList<>(); // Initialize the posts list

    public void addPost(Post post) {
        this.posts.add(post);
    }
}