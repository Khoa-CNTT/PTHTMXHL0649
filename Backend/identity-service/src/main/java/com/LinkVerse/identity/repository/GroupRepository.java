package com.LinkVerse.identity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.LinkVerse.identity.entity.Group;

public interface GroupRepository extends JpaRepository<Group, String>, JpaSpecificationExecutor<Group> {
    Optional<Group> findByName(String name); // Sửa thành Optional<Group>

    @Query("SELECT g FROM Group g ORDER BY g.memberCount DESC")
    List<Group> findTop10ByOrderByMemberCountDesc();
}
