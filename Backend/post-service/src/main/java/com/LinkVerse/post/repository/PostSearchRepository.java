//package com.LinkVerse.post.repository;
//
//import com.LinkVerse.post.entity.PostDocument;
//import com.LinkVerse.post.entity.PostVisibility;
//import org.springframework.data.elasticsearch.annotations.Query;
//import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface PostSearchRepository extends ElasticsearchRepository<PostDocument, String> {
//    List<PostDocument> findByContentContaining(String content);
//
//    List<PostDocument> findByComments_ContentContaining(String commentText);
//
//    // dùng 000Z tránh lỗi định dạng
//    @Query("{\"range\": {\"createdAt\": {\"gte\": \"?0-01-01T00:00:00.000Z\", \"lte\": \"?0-12-31T23:59:59.999Z\"}}}")
//    List<PostDocument> findByCreatedAtInYear(int year);
//
//    @Query("{\"range\": {\"createdAt\": {\"gte\": \"?0-?1-01T00:00:00.000Z\", \"lte\": \"?0-?1-31T23:59:59.999Z\"}}}")
//    List<PostDocument> findByCreatedAtInYearAndMonth(int year, int month);
//}
