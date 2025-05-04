package com.LinkVerse.post;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FileUtil {

    private static final List<String> IMAGE_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp"
    );
    private static final Map<String, String> FILE_EXTENSION_TO_MIME;

    static {
        FILE_EXTENSION_TO_MIME = new HashMap<>();
        FILE_EXTENSION_TO_MIME.put("jpg", "image/jpeg");
        FILE_EXTENSION_TO_MIME.put("jpeg", "image/jpeg");
        FILE_EXTENSION_TO_MIME.put("png", "image/png");
        FILE_EXTENSION_TO_MIME.put("gif", "image/gif");
        FILE_EXTENSION_TO_MIME.put("bmp", "image/bmp");
        FILE_EXTENSION_TO_MIME.put("webp", "image/webp");
    }


    public static boolean isImageFile(MultipartFile file) {
        return IMAGE_CONTENT_TYPES.contains(file.getContentType());

    }

    public static String getContentTypeFromFileName(String fileName) {
        String extension = getFileExtension(fileName);
        return FILE_EXTENSION_TO_MIME.getOrDefault(extension, MediaType.APPLICATION_OCTET_STREAM_VALUE);
    }

    private static String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}