package com.LinkVerse.identity.entity;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "`groups`")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "description")
    String description;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    User owner;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<GroupMember> members;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    GroupVisibility visibility; // Thêm field visibility

    @Column(name = "member_count", nullable = false)
    int memberCount; // Thêm field memberCount

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;
}
