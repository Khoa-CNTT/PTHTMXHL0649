package com.LinkVerse.identity.controller.chat;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.dto.request.SendMessageRequest;
import com.LinkVerse.identity.entity.Message;
import com.LinkVerse.identity.entity.MessageType;
import com.LinkVerse.identity.entity.User;
import com.LinkVerse.identity.exception.MessageException;
import com.LinkVerse.identity.service.UserService;
import com.LinkVerse.identity.service.chat.MessageService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MessageController {
    final MessageService messageService;
    final UserService userService;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        return userService.findUserById(userId);
    }

    @PostMapping("/create")
    public ResponseEntity<Message> sendMessageHandler(
            @RequestParam("chatId") Integer chatId,
            @RequestParam("content") String content,
            @RequestParam("type") String type,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        User user = getAuthenticatedUser();

        SendMessageRequest sendMessageRequest = SendMessageRequest.builder()
                .chatId(chatId)
                .content(content)
                .type(MessageType.valueOf(type))
                .images(images)
                .userId(user.getId())
                .build();

        Message message = messageService.sendMessage(sendMessageRequest);

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<List<Message>> getChatMessageHandler(@PathVariable Integer chatId) {
        List<Message> messages = messageService.getChatsMessages(chatId);
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<String>> deleteMessageHandler(@PathVariable Integer messageId)
            throws MessageException {
        messageService.deleteMessage(messageId);
        ApiResponse<String> res =
                ApiResponse.<String>builder().message("Deleted successfully...").build();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping("/{chatId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer chatId) {
        messageService.markMessagesAsRead(chatId);
        return ResponseEntity.ok().build();
    }
}
