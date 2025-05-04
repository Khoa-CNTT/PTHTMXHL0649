
package com.LinkVerse.post.Mapper;

import com.LinkVerse.post.dto.response.CommentResponse;
import com.LinkVerse.post.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "imageUrls", source = "imageUrls")
    @Mapping(target = "commentId", source = "commentId")
    @Mapping(target = "content", source = "content")
    @Mapping(target = "createdDate", source = "createdDate")
    @Mapping(target = "like", source = "like")
    @Mapping(target = "unlike", source = "unlike")
    CommentResponse toCommentResponse(Comment comment);
}