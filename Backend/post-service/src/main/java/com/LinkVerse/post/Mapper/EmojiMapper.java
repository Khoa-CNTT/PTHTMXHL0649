package com.LinkVerse.post.Mapper;

import com.LinkVerse.post.dto.response.EmojiResponse;
import com.LinkVerse.post.entity.Emoji;
import org.mapstruct.Mapper;

@Mapper
public interface EmojiMapper {
    EmojiResponse toEmojiResponse(Emoji emoji);
}
