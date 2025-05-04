package com.LinkVerse.post.Mapper;

import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.SharedPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = PostMapper.class)
public interface ShareMapper {

    @Mapping(source = "originalPost", target = "sharedPost", qualifiedByName = "singlePostToList")
    @Mapping(source = "imageUrls", target = "imageUrls")
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    PostResponse toPostResponse(SharedPost sharedPost);

    @Named("sharedPostListToPostResponseList")
    List<PostResponse> toPostResponseList(List<SharedPost> sharedPosts);
}