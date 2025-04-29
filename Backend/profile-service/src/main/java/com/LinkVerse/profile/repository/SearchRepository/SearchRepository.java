package com.LinkVerse.profile.repository.SearchRepository;

import static com.LinkVerse.profile.enums.AppConst.SEARCH_OPERATOR;
import static com.LinkVerse.profile.enums.AppConst.SORT_BY;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.LinkVerse.profile.entity.UserProfile;
import com.LinkVerse.profile.mapper.UserProfileMapper;
import com.LinkVerse.profile.repository.SearchRepository.criteria.SearchCriteria;
import com.LinkVerse.profile.repository.SearchRepository.criteria.UserSearchCriteriaQueryConsumer;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class SearchRepository {

    @PersistenceContext
    EntityManager entityManager;
    // cung cấp các API cho việc tương tác với các Entity

    UserProfileMapper userProfileMapper;

    private static final String LIKE_FORMAT = "%%%s%%";

    // 1 find user by string
    // SearchRepository.java
    // SearchRepository.java
    public Page<UserProfile> getUsersWithSortByColumnAndSearch(int page, int size, String sortBy, String search) {
        StringBuilder sqlQuery = new StringBuilder("SELECT u FROM UserProfile u WHERE 1=1");
        if (StringUtils.hasLength(search)) {
            sqlQuery.append(" AND (LOWER(u.firstName) LIKE LOWER(:search)")
                    .append(" OR LOWER(u.lastName) LIKE LOWER(:search)")
                    .append(" OR LOWER(u.email) LIKE LOWER(:search))");
        }

        if (StringUtils.hasLength(sortBy)) {
            Pattern pattern = Pattern.compile("(\\w+?)(:)(asc|desc)");
            Matcher matcher = pattern.matcher(sortBy);
            if (matcher.find()) {
                sqlQuery.append(String.format(" ORDER BY u.%s %s", matcher.group(1), matcher.group(3)));
            }
        }

        Query selectedQuery = entityManager.createQuery(sqlQuery.toString());
        if (StringUtils.hasLength(search)) {
            selectedQuery.setParameter("search", String.format("%%%s%%", search));
        }
        selectedQuery.setFirstResult(page * size);
        selectedQuery.setMaxResults(size);
        List<UserProfile> users = selectedQuery.getResultList();

        StringBuilder sqlCountQuery = new StringBuilder("SELECT COUNT(u) FROM UserProfile u WHERE 1=1");
        if (StringUtils.hasLength(search)) {
            sqlCountQuery
                    .append(" AND (LOWER(u.firstName) LIKE LOWER(:search)")
                    .append(" OR LOWER(u.lastName) LIKE LOWER(:search)")
                    .append(" OR LOWER(u.email) LIKE LOWER(:search))");
        }

        Query selectedCountQuery = entityManager.createQuery(sqlCountQuery.toString());
        if (StringUtils.hasLength(search)) {
            selectedCountQuery.setParameter("search", String.format("%%%s%%", search));
        }
        Long totalElement = (Long) selectedCountQuery.getSingleResult();

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(users, pageable, totalElement);
    }

    // 2 criteria
    public Page<UserProfile> advancedSearchUser(int page, int size, String sortBy, String... search) {
        List<SearchCriteria> criteriaList = new ArrayList<>();
        if (search != null) {
            for (String s : search) {
                Pattern pattern = Pattern.compile(SEARCH_OPERATOR);
                Matcher matcher = pattern.matcher(s);
                if (matcher.find()) {
                    criteriaList.add(new SearchCriteria(matcher.group(1), matcher.group(2), matcher.group(3)));
                }
            }
        }

        List<UserProfile> users = getUsers(page, size, criteriaList, sortBy);
        Long totalElement = getTotalElement(criteriaList);
        Pageable pageable = PageRequest.of(page, size);

        return new PageImpl<>(users, pageable, totalElement.intValue());
    }

    private List<UserProfile> getUsers(int page, int size, List<SearchCriteria> criteriaList, String sortBy) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<UserProfile> criteriaQuery = criteriaBuilder.createQuery(UserProfile.class);
        Root<UserProfile> root = criteriaQuery.from(UserProfile.class);

        Predicate predicate = criteriaBuilder.conjunction();
        UserSearchCriteriaQueryConsumer consumer =
                new UserSearchCriteriaQueryConsumer(criteriaBuilder, predicate, root);
        criteriaList.forEach(consumer);
        predicate = consumer.getPredicate();
        criteriaQuery.where(predicate);

        if (StringUtils.hasLength(sortBy)) {
            Pattern pattern = Pattern.compile(SORT_BY);
            Matcher matcher = pattern.matcher(sortBy);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(3).equalsIgnoreCase("asc")) {
                    criteriaQuery.orderBy(criteriaBuilder.asc(root.get(columnName)));
                } else {
                    criteriaQuery.orderBy(criteriaBuilder.desc(root.get(columnName)));
                }
            }
        }

        return entityManager
                .createQuery(criteriaQuery)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    private Long getTotalElement(List<SearchCriteria> criteriaList) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
        Root<UserProfile> root = criteriaQuery.from(UserProfile.class);

        Predicate predicate = criteriaBuilder.conjunction();
        UserSearchCriteriaQueryConsumer consumer =
                new UserSearchCriteriaQueryConsumer(criteriaBuilder, predicate, root);

        criteriaList.forEach(consumer);
        predicate = consumer.getPredicate();
        criteriaQuery.select(criteriaBuilder.count(root));
        criteriaQuery.where(predicate);

        criteriaQuery.select(criteriaBuilder.count(root));
        return entityManager.createQuery(criteriaQuery).getSingleResult();
    }
}
