package com.LinkVerse.profile.entity;

public enum FriendshipStatus {
    PENDING, // Lời mời kết bạn đang chờ xác nhận
    ACCEPTED, // Đã trở thành bạn bè
    BLOCKED, // Một trong hai người đã block người kia
    REJECTED, // Lời mời kết bạn bị từ chối
    NONE // Không có mối quan hệ
}
