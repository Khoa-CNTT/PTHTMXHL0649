package com.LinkVerse.post.dto.request;

import com.LinkVerse.post.entity.PostVisibility;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharePostRequest {

    private String content;
    private PostVisibility visibility;
}
