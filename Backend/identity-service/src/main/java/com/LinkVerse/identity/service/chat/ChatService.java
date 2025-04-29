package com.LinkVerse.identity.service.chat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.dto.request.GroupChatRequest;
import com.LinkVerse.identity.dto.response.ChatResponse;
import com.LinkVerse.identity.entity.*;
import com.LinkVerse.identity.exception.AppException;
import com.LinkVerse.identity.exception.ErrorCode;
import com.LinkVerse.identity.mapper.ChatMapper;
import com.LinkVerse.identity.repository.ChatRepository;
import com.LinkVerse.identity.repository.MessageRepository;
import com.LinkVerse.identity.repository.UserRepository;
import com.LinkVerse.identity.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatService {
    UserService userService;
    ChatRepository chatRepository;
    UserRepository userRepository;
    ChatMapper chatMapper;
    MessageRepository messageRepository;
    SimpMessagingTemplate messagingTemplate;
    S3Service s3Service;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = authentication.getName();
        return userRepository.findUserById(userID);
    }

    public ChatResponse createChat(String name) {
        User reqUser = getAuthenticatedUser();
        User user = userRepository.findUserByUsername(name);

        Chat isChatExist = chatRepository.findSingleChatByUserIds(user, reqUser);
        if (isChatExist != null) {
            return chatMapper.toChatResponse(isChatExist);
        }

        Chat chat = new Chat();
        chat.setCreatedBy(reqUser);
        chat.getUsers().add(user);
        chat.getUsers().add(reqUser);
        chat.setChatName(user.getUsername());
        chat.setChatImage(user.getImageUrl());
        chat.setGroup(false);

        Chat savedChat = chatRepository.save(chat);
        return chatMapper.toChatResponse(savedChat);
    }

    public Chat findChatEntityById(Integer chatId) {
        return chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.INVALID_CHAT_ID));
    }

    public ApiResponse<ChatResponse> findChatById(Integer chatId) {
        Chat chat = findChatEntityById(chatId);
        ChatResponse chatResponse = chatMapper.toChatResponse(chat);
        return ApiResponse.<ChatResponse>builder().result(chatResponse).build();
    }

    public ApiResponse<List<ChatResponse>> findAllChatByUserId(String id) {
        User user = userService.findUserById(id);
        List<Chat> chats = chatRepository.findChatByUserId(user.getId());
        List<ChatResponse> chatResponses =
                chats.stream().map(chatMapper::toChatResponse).collect(Collectors.toList());
        return ApiResponse.<List<ChatResponse>>builder().result(chatResponses).build();
    }

    public ApiResponse<ChatResponse> createGroup(GroupChatRequest req) {
        User reqUser = getAuthenticatedUser();
        Chat group = new Chat();
        group.setGroup(true);
        group.setChatName(req.getChatName());
        group.setCreatedBy(reqUser);
        group.getAdmins().add(reqUser);
        group.getUsers().add(reqUser);

        if (req.getUserIds() != null) {
            for (String userId : req.getUserIds()) {
                User user = userService.findUserById(userId);
                group.getUsers().add(user);
            }
        }

        Chat savedGroup = chatRepository.save(group);
        ChatResponse chatResponse = chatMapper.toChatResponse(savedGroup);
        return ApiResponse.<ChatResponse>builder().result(chatResponse).build();
    }

    public ApiResponse<ChatResponse> addUserToGroup(String name, Integer chatId) {
        User reqUser = getAuthenticatedUser();
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.INVALID_CHAT_ID));

        User user = userRepository.findUserById(name);

        if (chat.getAdmins().contains(reqUser)) {
            chat.getUsers().add(user);
            Chat savedChat = chatRepository.save(chat);
            ChatResponse chatResponse = chatMapper.toChatResponse(savedChat);
            sendSystemMessage(chat, user.getUsername() + " đã được thêm vào nhóm.");
            return ApiResponse.<ChatResponse>builder().result(chatResponse).build();
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED_ADD);
        }
    }

    public ApiResponse<ChatResponse> renameGroup(Integer chatId, String groupName) {
        User reqUser = getAuthenticatedUser();
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.INVALID_CHAT_ID));

        if (chat.getUsers().contains(reqUser)) {
            chat.setChatName(groupName);
            Chat savedChat = chatRepository.save(chat);
            ChatResponse chatResponse = chatMapper.toChatResponse(savedChat);
            return ApiResponse.<ChatResponse>builder().result(chatResponse).build();
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED_RENAME);
        }
    }

    public ApiResponse<ChatResponse> removeFromGroup(Integer chatId, String name) {
        User reqUser = getAuthenticatedUser();
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.INVALID_CHAT_ID));

        User user = userService.findUserById(name);

        if (chat.getAdmins().contains(reqUser)
                || (chat.getUsers().contains(reqUser) && user.getId().equals(reqUser.getId()))) {
            chat.getUsers().remove(user);
            Chat savedChat = chatRepository.save(chat);
            ChatResponse chatResponse = chatMapper.toChatResponse(savedChat);
            sendSystemMessage(chat, user.getUsername() + " đã rời khỏi nhóm.");
            return ApiResponse.<ChatResponse>builder().result(chatResponse).build();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED_REMOVE);
    }

    public ApiResponse<String> deleteChat(Integer chatId) {
        User reqUser = getAuthenticatedUser();
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new AppException(ErrorCode.INVALID_CHAT_ID));

        if (chat.isGroup()) {
            if (!chat.getAdmins().contains(reqUser)
                    && !chat.getCreatedBy().getId().equals(reqUser.getId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED_DELETE);
            }
        } else {
            if (!chat.getUsers().contains(reqUser)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_DELETE);
            }
        }

        List<Message> messages = messageRepository.findByChatId(chatId);

        for (Message message : messages) {
            if (message.getType() == MessageType.IMAGE || message.getType() == MessageType.STICKER) {
                String content = message.getContent();
                if (content != null && !content.isEmpty()) {
                    String[] urls = content.split(" ");
                    for (String url : urls) {
                        try {
                            String fileName = extractFileNameFromUrl(url);
                            s3Service.deleteFile(fileName);
                        } catch (Exception e) {
                            log.error("Failed to delete S3 file for message {}: {}", message.getId(), e.getMessage());
                        }
                    }
                }
            }
        }

        messageRepository.deleteAllByChat_Id(chatId);

        chatRepository.delete(chat);

        return ApiResponse.<String>builder()
                .result("Chat with ID " + chatId + " deleted successfully.")
                .build();
    }

    public void sendSystemMessage(Chat chat, String content) {
        Message message = new Message();
        message.setChat(chat);
        message.setUser(null);
        message.setType(MessageType.SYSTEM);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        messageRepository.save(message);

        if (chat.isGroup()) {
            messagingTemplate.convertAndSend("/group/" + chat.getId(), message);
        }
    }

    private String extractFileNameFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }
}
