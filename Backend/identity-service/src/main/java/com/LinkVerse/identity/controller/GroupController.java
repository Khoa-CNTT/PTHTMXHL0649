package com.LinkVerse.identity.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.identity.dto.request.GroupRequest;
import com.LinkVerse.identity.dto.response.GroupMemberResponse;
import com.LinkVerse.identity.dto.response.GroupResponse;
import com.LinkVerse.identity.entity.GroupMember;
import com.LinkVerse.identity.entity.GroupVisibility;
import com.LinkVerse.identity.service.GroupService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class GroupController {
    GroupService groupService;

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(@RequestBody @Valid GroupRequest request) {

        ApiResponse<GroupResponse> response = groupService.createGroup(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{groupId}/isUserInGroup")
    public ResponseEntity<Boolean> isUserInGroup(@PathVariable String groupId) {
        boolean isInGroup = groupService.isUserInGroup(groupId);
        return ResponseEntity.ok(isInGroup);
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<ApiResponse<List<GroupMemberResponse>>> getGroupMembers(@PathVariable String groupId) {
        ApiResponse<List<GroupMemberResponse>> response = groupService.getGroupMembers(groupId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{groupId}/isOwnerOrLeader")
    public ResponseEntity<Boolean> isOwnerorLeader(@PathVariable String groupId) {
        boolean isInGroup = groupService.isUserOwnerOrLeader(groupId);
        return ResponseEntity.ok(isInGroup);
    }

    @GetMapping("/{groupId}/isPublic")
    public ResponseEntity<Boolean> isGroupPublic(@PathVariable String groupId) {
        boolean isPublic = groupService.isGroupPublic(groupId);
        return ResponseEntity.ok(isPublic);
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<ApiResponse<GroupResponse>> removeMemberFromGroup(
            @PathVariable String groupId, @PathVariable String memberId) {

        ApiResponse<GroupResponse> response = groupService.removeMemberFromGroup(groupId, memberId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<ApiResponse<GroupResponse>> addMemberToGroup(
            @PathVariable String groupId, @PathVariable String memberId) {

        ApiResponse<GroupResponse> response = groupService.addMemberToGroup(groupId, memberId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{groupId}/visibility")
    public ResponseEntity<GroupResponse> changeGroupVisibility(
            @PathVariable String groupId, @RequestParam GroupVisibility newVisibility) {
        return ResponseEntity.ok(
                groupService.changeGroupVisibility(groupId, newVisibility).getResult());
    }

    @GetMapping("/{groupId}")
    public ApiResponse<GroupResponse> getGroup(@PathVariable String groupId) {
        return groupService.getGroupById(groupId);
    }

    @GetMapping("/all")
    public ApiResponse<Page<GroupResponse>> getAllGroup(@RequestParam int page, @RequestParam int size) {
        return groupService.getAllGroup(page, size);
    }

    @PatchMapping("/{groupId}/changeMemberRole")
    public ResponseEntity<ApiResponse<GroupResponse>> changeMemberRole(
            @PathVariable String groupId, @RequestParam String memberId, @RequestParam GroupMember.MemberRole newRole) {

        ApiResponse<GroupResponse> response = groupService.changeMemberRole(groupId, memberId, newRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<GroupResponse>>> searchGroups(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) GroupVisibility visibility,
            @RequestParam(required = false) Integer minMembers,
            @RequestParam(required = false) String ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(groupService.searchGroups(keyword, visibility, minMembers, ownerId, pageable));
    }

    @GetMapping("/top10")
    public ApiResponse<List<GroupResponse>> getTop10GroupsByMembers() {
        return groupService.getTop10GroupsByMembers();
    }
}
