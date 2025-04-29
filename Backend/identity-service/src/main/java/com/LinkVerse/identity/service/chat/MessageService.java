package com.LinkVerse.identity.service.chat;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.LinkVerse.identity.dto.request.SendMessageRequest;
import com.LinkVerse.identity.entity.*;
import com.LinkVerse.identity.exception.AppException;
import com.LinkVerse.identity.exception.ErrorCode;
import com.LinkVerse.identity.exception.MessageException;
import com.LinkVerse.identity.repository.MessageReadStatusRepository;
import com.LinkVerse.identity.repository.MessageRepository;
import com.LinkVerse.identity.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MessageService {
    MessageRepository messageRepository;
    ChatService chatService;
    SimpMessagingTemplate messagingTemplate;
    UserRepository userRepository;
    S3Service s3Service;
    MessageReadStatusRepository messageReadStatusRepository;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = authentication.getName();
        return userRepository.findUserById(userID);
    }

    public Message sendMessage(SendMessageRequest req) {
        User user = getAuthenticatedUser();
        Chat chat = chatService.findChatEntityById(req.getChatId());

        Message message = new Message();
        message.setChat(chat);
        message.setUser(user);
        message.setContent(req.getContent());
        message.setType(req.getType() != null ? req.getType() : MessageType.TEXT);
        message.setTimestamp(LocalDateTime.now());

        if ((req.getType() == MessageType.IMAGE || req.getType() == MessageType.STICKER)
                && req.getImages() != null
                && !req.getImages().isEmpty()) {
            List<String> uploadedImageUrls = s3Service.uploadFiles(req.getImages());

            message.setContent(String.join(" ", uploadedImageUrls));
        }

        message = messageRepository.save(message);

        if (chat.isGroup()) {
            messagingTemplate.convertAndSend("/group/" + chat.getId(), message);
        } else {
            messagingTemplate.convertAndSend("/user/" + chat.getId(), message);
        }
        return message;
    }

    public List<Message> getChatsMessages(Integer chatId) {
        User reqUser = getAuthenticatedUser();
        Chat chat = chatService.findChatEntityById(chatId);

        if (!chat.getUsers().contains(reqUser)) {
            throw new AppException(ErrorCode.NOT_RELATE_CHAT);
        }

        return messageRepository.findByChatId(chat.getId());
    }

    //    public Message findMessageById(Integer messageId) throws MessageException {
    //        return messageRepository.findById(messageId)
    //                .orElseThrow(() -> new MessageException("The required message is not found"));
    //    }

    public void deleteMessage(Integer messageId) throws MessageException {
        User reqUser = getAuthenticatedUser();
        Message message = messageRepository
                .findById(messageId)
                .orElseThrow(() -> new MessageException("The required message is not found"));

        if (!message.getUser().getId().equals(reqUser.getId())) {
            throw new MessageException("You are not authorized for this task");
        }

        if (message.getType() == MessageType.IMAGE || message.getType() == MessageType.STICKER) {
            String content = message.getContent();
            if (content != null && !content.isEmpty()) {
                String[] urls = content.split(" ");
                for (String url : urls) {
                    try {
                        String fileName = extractFileNameFromUrl(url);
                        s3Service.deleteFile(fileName);
                    } catch (Exception e) {
                        log.error("Failed to delete S3 file for message {}: {}", messageId, e.getMessage());
                    }
                }
            }
        }

        // Xoá message trong DB
        messageRepository.delete(message);
    }

    public void markMessagesAsRead(Integer chatId) {
        User user = getAuthenticatedUser();
        List<Message> messages = messageRepository.findByChatId(chatId);
        for (Message message : messages) {
            messageReadStatusRepository.findByMessageAndUser(message, user).orElseGet(() -> {
                MessageReadStatus status = new MessageReadStatus();
                status.setMessage(message);
                status.setUser(user);
                status.setReadAt(LocalDateTime.now());
                return messageReadStatusRepository.save(status);
            });
        }
    }

    public List<Message> searchMessagesInChat(Integer chatId, String keyword) {
        User user = getAuthenticatedUser();
        Chat chat = chatService.findChatEntityById(chatId);
        if (!chat.getUsers().contains(user)) {
            throw new AppException(ErrorCode.NOT_RELATE_CHAT);
        }
        return messageRepository.searchMessages(chatId, keyword);
    }

    private String extractFileNameFromUrl(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        return fileName;
    }
}
