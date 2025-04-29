package com.LinkVerse.identity.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.LinkVerse.identity.dto.response.ChatResponse;
import com.LinkVerse.identity.dto.response.UserResponse;
import com.LinkVerse.identity.entity.Chat;

@Component
public class ChatMapper {
    @Autowired
    private UserMapper userMapper;

    public ChatResponse toChatResponse(Chat chat) {
        Set<UserResponse> userResponses =
                chat.getUsers().stream().map(userMapper::toUserResponse).collect(Collectors.toSet());

        return ChatResponse.builder()
                .id(chat.getId())
                .chatName(chat.getChatName())
                .chatImage(chat.getChatImage())
                .isGroup(chat.isGroup())
                .users(userResponses)
                .build();
    }
}
