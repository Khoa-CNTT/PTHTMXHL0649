package com.LinkVerse.profile.dto.response;

import com.LinkVerse.profile.entity.FriendshipStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FriendshipResponse {
    private String senderUsername;
    private String recipientUsername;
    private FriendshipStatus status;
}
