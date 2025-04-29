package com.LinkVerse.identity.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.LinkVerse.event.dto.GroupEvent;
import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.dto.request.GroupRequest;
import com.LinkVerse.identity.dto.response.GroupMemberResponse;
import com.LinkVerse.identity.dto.response.GroupResponse;
import com.LinkVerse.identity.entity.Group;
import com.LinkVerse.identity.entity.GroupMember;
import com.LinkVerse.identity.entity.GroupVisibility;
import com.LinkVerse.identity.entity.User;
import com.LinkVerse.identity.exception.AppException;
import com.LinkVerse.identity.exception.ErrorCode;
import com.LinkVerse.identity.repository.GroupMemberRepository;
import com.LinkVerse.identity.repository.GroupRepository;
import com.LinkVerse.identity.repository.UserRepository;
import com.LinkVerse.identity.repository.httpclient.ProfileClient;
import com.LinkVerse.identity.spec.GroupSpecification;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GroupService {
    GroupRepository groupRepository;
    GroupMemberRepository groupMemberRepository;
    UserRepository userRepository;
    GroupEventProducer groupEventProducer;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public ApiResponse<GroupResponse> createGroup(GroupRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            log.info("Admin đang tạo nhóm: " + request.getName());
        }

        String userId = authentication.getName();

        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (groupRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.GROUP_ALREADY_EXISTS);
        }

        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .visibility(request.getVisibility())
                .memberCount(1)
                .owner(user)
                .createdAt(LocalDateTime.now())
                .build();

        group = groupRepository.save(group);

        GroupEvent groupEvent = GroupEvent.builder()
                .groupId(group.getId())
                .memberCount(group.getMemberCount())
                .createdAt(group.getCreatedAt())
                .visibility(group.getVisibility())
                .build();

        kafkaTemplate.send("groups-events", groupEvent);

        GroupMember.MemberRole creatorRole = isAdmin ? GroupMember.MemberRole.OWNER : GroupMember.MemberRole.LEADER;

        GroupMember groupMember =
                GroupMember.builder().group(group).user(user).role(creatorRole).build();
        groupMemberRepository.save(groupMember);
        groupEventProducer.publishGroupCreatedEvent(group, creatorRole.name());

        return ApiResponse.<GroupResponse>builder()
                .code(200)
                .message("Group created successfully")
                .result(GroupResponse.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .description(group.getDescription())
                        .memberCount(group.getMemberCount())
                        .visibility(group.getVisibility().name())
                        .build())
                .build();
    }

    public ApiResponse<GroupResponse> changeGroupVisibility(String groupId, GroupVisibility newVisibility) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        GroupMember groupMember = groupMemberRepository
                .findByGroupAndUser(
                        group,
                        userRepository
                                .findById(currentUserId)
                                .orElseThrow(() -> new RuntimeException("User not found")))
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (groupMember.getRole() != GroupMember.MemberRole.OWNER
                && groupMember.getRole() != GroupMember.MemberRole.LEADER) {
            throw new RuntimeException("You are not authorized to change the visibility of this group");
        }

        group.setVisibility(newVisibility);
        group = groupRepository.save(group);

        GroupResponse groupResponse = GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .memberCount(group.getMemberCount())
                .visibility(group.getVisibility().name())
                .build();

        return ApiResponse.<GroupResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Group visibility updated successfully")
                .result(groupResponse)
                .build();
    }

    @Transactional
    public ApiResponse<GroupResponse> addMemberToGroup(String groupId, String memberId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String requesterId = authentication.getName();

        User requester =
                userRepository.findById(requesterId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));

        // Kiểm tra quyền của requester (phải là LEADER hoặc OWNER)
        GroupMember requesterMember = groupMemberRepository
                .findByGroupAndUser(group, requester)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_DENIED));

        // Chỉ OWNER hoặc LEADER mới có quyền thêm thành viên
        if (requesterMember.getRole() != GroupMember.MemberRole.OWNER
                && requesterMember.getRole() != GroupMember.MemberRole.LEADER) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        User member = userRepository.findById(memberId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (groupMemberRepository.findByGroupAndUser(group, member).isPresent()) {
            throw new AppException(ErrorCode.ALREADY_MEMBER);
        }
        // Đặt vai trò cho thành viên mới: nếu là OWNER thêm vào thì gán vai trò LEADER, nếu LEADER hoặc MEMBER thêm thì
        // gán vai trò MEMBER
        GroupMember.MemberRole newMemberRole = (requesterMember.getRole() == GroupMember.MemberRole.OWNER)
                ? GroupMember.MemberRole.LEADER
                : GroupMember.MemberRole.MEMBER;

        // Thêm người dùng mới vào nhóm với vai trò tương ứng
        GroupMember newMember = GroupMember.builder()
                .group(group)
                .user(member)
                .role(newMemberRole)
                .build();
        groupMemberRepository.save(newMember);

        group.setMemberCount(group.getMemberCount() + 1);
        groupRepository.save(group);

        groupEventProducer.publishMemberAddedEvent(groupId, newMemberRole.name());

        GroupResponse groupResponse = GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .memberCount(group.getMemberCount())
                .visibility(group.getVisibility().name())
                .build();
        return ApiResponse.<GroupResponse>builder()
                .code(200)
                .message("Member added successfully")
                .result(groupResponse)
                .build();
    }

    @Transactional
    public ApiResponse<GroupResponse> removeMemberFromGroup(String groupId, String memberId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String requesterId = authentication.getName();

        User requester =
                userRepository.findById(requesterId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));
        // Kiemtra
        GroupMember requesterMember = groupMemberRepository
                .findByGroupAndUser(group, requester)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_DENIED));

        if (requesterMember.getRole() != GroupMember.MemberRole.OWNER
                && requesterMember.getRole() != GroupMember.MemberRole.LEADER) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        User member = userRepository.findById(memberId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        GroupMember groupMember = groupMemberRepository
                .findByGroupAndUser(group, member)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_IN_GROUP));

        groupMemberRepository.delete(groupMember);

        group.setMemberCount(group.getMemberCount() - 1);
        groupRepository.save(group);

        profileClient.deleteUserProfile(memberId);

        groupEventProducer.publishMemberRemovedEvent(groupId, memberId);

        GroupResponse groupResponse = GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .memberCount(group.getMemberCount())
                .visibility(group.getVisibility().name())
                .build();

        return ApiResponse.<GroupResponse>builder()
                .code(200)
                .message("Member removed successfully")
                .result(groupResponse)
                .build();
    }

    @Transactional
    public ApiResponse<GroupResponse> getGroupById(String groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));

        GroupResponse groupResponse = GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .memberCount(group.getMemberCount())
                .visibility(group.getVisibility().name())
                .build();

        // Trả về API Response
        return ApiResponse.<GroupResponse>builder()
                .code(200)
                .message("Tìm nhóm thành công")
                .result(groupResponse)
                .build();
    }

    @Transactional
    public ApiResponse<Page<GroupResponse>> getAllGroup(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Group> groupPage = groupRepository.findAll(pageable);
        List<GroupResponse> groupResponses = groupPage.getContent().stream()
                .map(group -> GroupResponse.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .description(group.getDescription())
                        .memberCount(group.getMemberCount())
                        .visibility(group.getVisibility().name())
                        .build())
                .toList();
        Page<GroupResponse> responsePage = new PageImpl<>(groupResponses, pageable, groupPage.getTotalElements());

        return ApiResponse.<Page<GroupResponse>>builder()
                .code(200)
                .message("Lấy danh sách nhóm thành công")
                .result(responsePage)
                .build();
    }

    @Transactional
    public boolean isUserInGroup(String groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));

        return groupMemberRepository
                .findByGroupAndUser(
                        group,
                        userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)))
                .isPresent();
    }

    @Transactional
    public boolean isGroupPublic(String groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));

        return group.getVisibility() == GroupVisibility.PUBLIC;
    }

    @Transactional
    public boolean isUserOwnerOrLeader(String groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));

        GroupMember groupMember = groupMemberRepository
                .findByGroupAndUser(
                        group,
                        userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)))
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_DENIED));

        return groupMember.getRole() == GroupMember.MemberRole.OWNER
                || groupMember.getRole() == GroupMember.MemberRole.LEADER;
    }

    @Transactional
    public ApiResponse<List<GroupMemberResponse>> getGroupMembers(String groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String requesterId = authentication.getName();

        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));
        User requester =
                userRepository.findById(requesterId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        groupMemberRepository
                .findByGroupAndUser(group, requester)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_DENIED));

        List<GroupMember> groupMembers = groupMemberRepository.findByGroup(group);
        List<GroupMemberResponse> memberResponses = groupMembers.stream()
                .map(member -> GroupMemberResponse.builder()
                        .userId(member.getUser().getId())
                        .username(member.getUser().getUsername())
                        .role(member.getRole().name())
                        .build())
                .toList();

        return ApiResponse.<List<GroupMemberResponse>>builder()
                .code(200)
                .message("Group members retrieved successfully")
                .result(memberResponses)
                .build();
    }

    @Transactional
    public ApiResponse<GroupResponse> changeMemberRole(
            String groupId, String memberId, GroupMember.MemberRole newRole) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String requesterId = authentication.getName();

        User requester =
                userRepository.findById(requesterId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new AppException(ErrorCode.GROUP_NOT_EXIST));
        GroupMember requesterMember = groupMemberRepository
                .findByGroupAndUser(group, requester)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_DENIED));

        if (requesterMember.getRole() != GroupMember.MemberRole.OWNER
                && requesterMember.getRole() != GroupMember.MemberRole.LEADER) {
            throw new AppException(ErrorCode.PERMISSION_DENIED);
        }

        User member = userRepository.findById(memberId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        GroupMember groupMember = groupMemberRepository
                .findByGroupAndUser(group, member)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_IN_GROUP));

        if (newRole == GroupMember.MemberRole.LEADER) {
            long leaderCount = groupMemberRepository.countByGroupAndRole(group, GroupMember.MemberRole.LEADER);
            if (leaderCount >= 2) {
                throw new AppException(ErrorCode.MAX_LEADERS_REACHED);
            }
            if (groupMember.getRole() != GroupMember.MemberRole.MEMBER) {
                throw new AppException(ErrorCode.INVALID_ROLE_CHANGE);
            }
        } else if (newRole == GroupMember.MemberRole.MEMBER) {
            if (groupMember.getRole() != GroupMember.MemberRole.LEADER) {
                throw new AppException(ErrorCode.INVALID_ROLE_CHANGE);
            }
        } else {
            throw new AppException(ErrorCode.INVALID_ROLE_CHANGE);
        }

        groupMember.setRole(newRole);
        groupMemberRepository.save(groupMember);

        GroupResponse groupResponse = GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .memberCount(group.getMemberCount())
                .visibility(group.getVisibility().name())
                .build();

        return ApiResponse.<GroupResponse>builder()
                .code(200)
                .message("Member role changed successfully")
                .result(groupResponse)
                .build();
    }

    public ApiResponse<Page<GroupResponse>> searchGroups(
            String keyword, GroupVisibility visibility, Integer minMembers, String ownerId, Pageable pageable) {
        Specification<Group> spec = GroupSpecification.withFilters(keyword, visibility, minMembers, ownerId);
        Page<Group> result = groupRepository.findAll(spec, pageable);

        List<GroupResponse> responseList = result.getContent().stream()
                .map(group -> GroupResponse.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .description(group.getDescription())
                        .memberCount(group.getMemberCount())
                        .visibility(group.getVisibility().name())
                        .build())
                .toList();

        return ApiResponse.<Page<GroupResponse>>builder()
                .code(200)
                .message("Tìm kiếm nhóm thành công")
                .result(new PageImpl<>(responseList, pageable, result.getTotalElements()))
                .build();
    }

    @Transactional
    public ApiResponse<List<GroupResponse>> getTop10GroupsByMembers() {
        // Get the top 10 groups by member count in descending order
        List<Group> topGroups = groupRepository.findTop10ByOrderByMemberCountDesc();

        // Map the result to GroupResponse
        List<GroupResponse> groupResponses = topGroups.stream()
                .map(group -> GroupResponse.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .description(group.getDescription())
                        .memberCount(group.getMemberCount())
                        .visibility(group.getVisibility().name())
                        .build())
                .collect(Collectors.toList());

        // Return the response
        return ApiResponse.<List<GroupResponse>>builder()
                .code(200)
                .message("Top 10 groups fetched successfully")
                .result(groupResponses)
                .build();
    }
}
