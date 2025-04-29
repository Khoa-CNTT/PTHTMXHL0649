package com.LinkVerse.identity.controller.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.LinkVerse.identity.entity.Message;

public class RealTimeChat {
    SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/message")
    @SendTo("/group/public")
    public Message recieveMessage(@Payload Message message) {
        simpMessagingTemplate.convertAndSend(
                "/group" + message.getChat().getId().toString(), message);
        return message;
    }
}
