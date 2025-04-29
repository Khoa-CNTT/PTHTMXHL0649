package com.LinkVerse.identity.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class GroupEvent {
    private String groupId;
    private String role;

    @JsonCreator
    public GroupEvent(@JsonProperty("groupId") String groupId, @JsonProperty("role") String role) {
        this.groupId = groupId;
        this.role = role;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
