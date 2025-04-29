package com.LinkVerse.identity.spec;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;

import com.LinkVerse.identity.entity.Group;
import com.LinkVerse.identity.entity.GroupVisibility;

public class GroupSpecification {

    public static Specification<Group> withFilters(
            String keyword, GroupVisibility visibility, Integer minMembers, String ownerId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicate = cb.and(
                        predicate,
                        cb.or(
                                cb.like(cb.lower(root.get("name")), like),
                                cb.like(cb.lower(root.get("description")), like)));
            }

            if (visibility != null) {
                predicate = cb.and(predicate, cb.equal(root.get("visibility"), visibility));
            }

            if (minMembers != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("memberCount"), minMembers));
            }

            if (ownerId != null && !ownerId.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("owner").get("id"), ownerId));
            }

            return predicate;
        };
    }
}
