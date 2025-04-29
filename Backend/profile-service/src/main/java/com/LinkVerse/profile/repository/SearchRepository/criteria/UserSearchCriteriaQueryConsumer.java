package com.LinkVerse.profile.repository.SearchRepository.criteria;

import java.util.function.Consumer;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import com.LinkVerse.profile.entity.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchCriteriaQueryConsumer implements Consumer<SearchCriteria> {
    // Consumer nhận một đối tượng kiểu T và thực hiện một hành động với đối tượng đó mà không trả về giá trị

    private CriteriaBuilder builder;
    private Predicate predicate; // điều kiện
    private Root root;

    @Override
    public void accept(SearchCriteria param) { // key:operation:value
        if (param.getOperation().equals(">")) {
            // predicate = where key > value (kiểu số)
            // builder.and() -> kết hợp nhiều điều kiện lại với nhau
            predicate = builder.and(
                    predicate,
                    builder.greaterThanOrEqualTo(
                            root.get(param.getKey()), param.getValue().toString()));
        } else if (param.getOperation().equals("<")) {
            predicate = builder.and(
                    predicate,
                    builder.lessThanOrEqualTo(
                            root.get(param.getKey()), param.getValue().toString()));
        } else if (param.getOperation().equals(":")) { // kiểu string
            if (root.get(param.getKey()).getJavaType() == String.class) {
                predicate =
                        builder.and(predicate, builder.like(root.get(param.getKey()), "%" + param.getValue() + "%"));
            } else if (root.get(param.getKey()).getJavaType() == UserStatus.class) { // kiểu enum
                UserStatus status =
                        UserStatus.valueOf(param.getValue().toString().toUpperCase());
                predicate = builder.and(predicate, builder.equal(root.get(param.getKey()), status));
            } else {
                predicate = builder.and(predicate, builder.equal(root.get(param.getKey()), param.getValue()));
            }
        }
    }
}
