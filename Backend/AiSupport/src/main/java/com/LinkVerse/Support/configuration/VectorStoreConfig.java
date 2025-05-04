//package com.LinkVerse.Support.configuration;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.ai.document.Document;
//import org.springframework.ai.embedding.FakeEmbeddingModel;
//import org.springframework.ai.reader.tika.TikaDocumentReader;
//import org.springframework.ai.transformer.splitter.TextSplitter;
//import org.springframework.ai.transformer.splitter.TokenTextSplitter;
//import org.springframework.ai.vectorstore.SimpleVectorStore;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.io.File;
//import java.util.List;
//
//@Slf4j
//@Configuration
//public class VectorStoreConfig {
//
//    @Bean
//    public SimpleVectorStore simpleVectorStore(VectorStoreProperties vectorStoreProperties) {
//        FakeEmbeddingModel fakeEmbeddingModel = new FakeEmbeddingModel(); // Tạo Embedding Model giả lập
//        SimpleVectorStore store = SimpleVectorStore.builder(fakeEmbeddingModel).build(); // Dùng FakeEmbeddingModel
//
//        File vectorStoreFile = new File(vectorStoreProperties.getVectorStorePath());
//
//        if (vectorStoreFile.exists()) {
//            store.load(vectorStoreFile);
//        } else {
//            log.debug("Loading documents into vector store");
//            vectorStoreProperties.getDocumentsToLoad().forEach(document -> {
//                log.debug("Loading document: " + document.getFilename());
//                TikaDocumentReader documentReader = new TikaDocumentReader(document);
//                List<Document> docs = documentReader.get();
//                TextSplitter textSplitter = new TokenTextSplitter();
//                List<Document> splitDocs = textSplitter.apply(docs);
//                store.add(splitDocs);
//            });
//
//            store.save(vectorStoreFile);
//        }
//
//        return store;
//    }
//}
//package com.LinkVerse.Support.configuration;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.ai.document.Document;
//import org.springframework.ai.embedding.FakeEmbeddingModel;
//import org.springframework.ai.reader.tika.TikaDocumentReader;
//import org.springframework.ai.transformer.splitter.TextSplitter;
//import org.springframework.ai.transformer.splitter.TokenTextSplitter;
//import org.springframework.ai.vectorstore.SimpleVectorStore;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.io.File;
//import java.util.List;
//
//@Slf4j
//@Configuration
//public class VectorStoreConfig {
//
//    @Bean
//    public SimpleVectorStore simpleVectorStore(VectorStoreProperties vectorStoreProperties) {
//        FakeEmbeddingModel fakeEmbeddingModel = new FakeEmbeddingModel(); // Tạo Embedding Model giả lập
//        SimpleVectorStore store = SimpleVectorStore.builder(fakeEmbeddingModel).build(); // Dùng FakeEmbeddingModel
//
//        File vectorStoreFile = new File(vectorStoreProperties.getVectorStorePath());
//
//        if (vectorStoreFile.exists()) {
//            store.load(vectorStoreFile);
//        } else {
//            log.debug("Loading documents into vector store");
//            vectorStoreProperties.getDocumentsToLoad().forEach(document -> {
//                log.debug("Loading document: " + document.getFilename());
//                TikaDocumentReader documentReader = new TikaDocumentReader(document);
//                List<Document> docs = documentReader.get();
//                TextSplitter textSplitter = new TokenTextSplitter();
//                List<Document> splitDocs = textSplitter.apply(docs);
//                store.add(splitDocs);
//            });
//
//            store.save(vectorStoreFile);
//        }
//
//        return store;
//    }
//}
