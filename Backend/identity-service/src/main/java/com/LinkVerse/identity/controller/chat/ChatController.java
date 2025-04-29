package com.LinkVerse.identity.controller.chat;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.dto.request.GroupChatRequest;
import com.LinkVerse.identity.dto.request.SingleChatRequest;
import com.LinkVerse.identity.dto.response.ChatResponse;
import com.LinkVerse.identity.entity.Message;
import com.LinkVerse.identity.service.chat.ChatService;
import com.LinkVerse.identity.service.chat.MessageService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatController {
    ChatService chatService;
    MessageService messageService;

    @PostMapping("/single")
    public ApiResponse<ChatResponse> createChatHandler(@RequestBody SingleChatRequest singleChatRequest) {
        ChatResponse chatResponse = chatService.createChat(singleChatRequest.getUserName());
        return ApiResponse.<ChatResponse>builder().result(chatResponse).build();
    }

    @PostMapping("/group")
    public ApiResponse<ChatResponse> createGroupHandler(@RequestBody GroupChatRequest groupChatRequest) {
        return chatService.createGroup(groupChatRequest);
    }

    @GetMapping("/{chatId}")
    public ApiResponse<ChatResponse> findChatByIdHandler(@PathVariable int chatId) {
        return chatService.findChatById(chatId);
    }

    @GetMapping("/user")
    public ApiResponse<List<ChatResponse>> findChatByUserIdHandler(@RequestParam String userId) {
        return chatService.findAllChatByUserId(userId);
    }

    @PutMapping("/{chatId}/add/{userId}")
    public ApiResponse<ChatResponse> addUserToGroupHandler(@PathVariable Integer chatId, @PathVariable String userId) {
        return chatService.addUserToGroup(userId, chatId);
    }

    @PutMapping("/{chatId}/remove/{userId}")
    public ApiResponse<ChatResponse> removeUserFromGroupHandler(
            @PathVariable Integer chatId, @PathVariable String userId) {
        return chatService.removeFromGroup(chatId, userId);
    }

    @PutMapping("/{chatId}/rename")
    public ApiResponse<ChatResponse> renameGroupHandler(@PathVariable Integer chatId, @RequestParam String groupName) {
        return chatService.renameGroup(chatId, groupName);
    }

    @DeleteMapping("/{chatId}")
    public ApiResponse<String> deleteChat(@PathVariable Integer chatId) {
        return chatService.deleteChat(chatId);
    }

    @GetMapping("/{chatId}/search")
    public ResponseEntity<List<Message>> searchMessages(@PathVariable Integer chatId, @RequestParam String keyword) {
        return ResponseEntity.ok(messageService.searchMessagesInChat(chatId, keyword));
    }
}
