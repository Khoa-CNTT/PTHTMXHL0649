package com.LinkVerse.post.Mapper;

import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.PostHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface PostHistoryMapper {

    @Named("mapPostHistoryToPostResponse")
    PostResponse toPostResponse(PostHistory postHistory);


}