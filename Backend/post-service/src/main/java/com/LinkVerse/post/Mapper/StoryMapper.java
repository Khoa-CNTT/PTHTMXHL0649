package com.LinkVerse.post.Mapper;

import com.LinkVerse.post.dto.request.StoryCreationRequest;
import com.LinkVerse.post.dto.response.StoryResponse;
import com.LinkVerse.post.entity.Story;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoryMapper {

    StoryResponse toResponse(Story story);
    @Mapping(target = "content", expression = "java(request.getContent() != null ? request.getContent() : \"\")")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "imageUrls", ignore = true)
    @Mapping(target = "postedAt", ignore = true)
    @Mapping(target = "expiryTime", ignore = true)
    Story toEntity(StoryCreationRequest request);
}