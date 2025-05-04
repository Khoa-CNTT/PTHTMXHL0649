
package com.LinkVerse.post.Mapper;

import com.LinkVerse.post.Mapper.CommentMapper;
import com.LinkVerse.post.dto.response.PostGroupResponse;
import com.LinkVerse.post.dto.response.PostPendingResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostGroup;
import com.LinkVerse.post.entity.PostPending;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CommentMapper.class})
public interface PostMapper {

    @Named("toPostResponse")
    @Mapping(target = "sharedPost", ignore = true)
    @Mapping(source = "share", target = "share")
    @Mapping(source = "likedUserIds", target = "likedUserIds")
    @Mapping(target = "username", ignore = true) // Will be set manually
    @Mapping(target = "imageUrl", ignore = true) // Will be set manually
    PostResponse toPostResponse(Post post);

    @Mapping(target = "groupId", ignore = false)
    PostGroupResponse toPostGroupResponse(PostGroup post);

    @Mapping(target = "groupId", ignore = false)
    PostPendingResponse toPostPendingResponse(PostPending post);

    @Named("singlePostToList")
    default List<PostResponse> singlePostToList(Post post) {
        return post != null ? List.of(toPostResponse(post)) : new ArrayList<>();
    }
}