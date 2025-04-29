package com.LinkVerse.identity.dto.request;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.LinkVerse.identity.entity.MessageType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendMessageRequest {
    String userId;
    Integer chatId;
    String content;
    MessageType type;
    List<MultipartFile> images;
}
