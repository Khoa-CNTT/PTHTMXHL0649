package com.LinkVerse.profile.repository;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.LinkVerse.profile.entity.Friendship;
import com.LinkVerse.profile.entity.FriendshipStatus;
import com.LinkVerse.profile.entity.UserProfile;

public interface FriendshipRepository extends JpaRepository<Friendship, String> {

    @Query(
            "SELECT f FROM Friendship f WHERE (f.sender = :user1 AND f.recipient = :user2) OR (f.sender = :user2 AND f.recipient = :user1)")
    Optional<Friendship> findByUserProfiles(@Param("user1") UserProfile user1, @Param("user2") UserProfile user2);

    @Query("SELECT f FROM Friendship f WHERE (f.sender = :user OR f.recipient = :user) AND f.status = :status")
    Set<Friendship> findFriendshipsByUserAndStatus(
            @Param("user") UserProfile user, @Param("status") FriendshipStatus status);

    Set<Friendship> findBySenderAndStatus(UserProfile sender, FriendshipStatus status);

    @Query(
            "SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f "
                    + "WHERE ((f.sender = :user1 AND f.recipient = :user2) OR (f.sender = :user2 AND f.recipient = :user1)) AND f.status = 'BLOCKED'")
    boolean isBlocked(@Param("user1") UserProfile user1, @Param("user2") UserProfile user2);

    @Modifying
    @Query("DELETE FROM Friendship f WHERE f.sender = :userProfile OR f.recipient = :userProfile")
    void deleteByUserProfile(@Param("userProfile") UserProfile userProfile);
}
