package com.LinkVerse.donation_service.service;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class S3Service {

    String bucketName = "imgpost-2";

    @Autowired
    AmazonS3 s3Client;

    public List<String> uploadFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of(); // Return empty list if no files
        }

        List<String> fileUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            // Skip empty files
            if (file == null || file.isEmpty()) {
                log.warn("Skipped empty or null file");
                continue;
            }

            File fileObj = null;
            try {
                MultipartFile resizedFile = resizeImage(file, 1080, 1920); // Resize image
                fileObj = convertMultiPartFileToFile(resizedFile);
                String fileName =
                        System.currentTimeMillis() + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();

                s3Client.putObject(new PutObjectRequest(bucketName, fileName, fileObj));
                fileUrls.add(s3Client.getUrl(bucketName, fileName).toString());
            } catch (SdkClientException e) {
                log.error("Failed to upload file to S3: {}", e.getMessage());
            } finally {
                // Delete temporary file after upload
                if (fileObj != null) {
                    fileObj.delete();
                }
            }
        }
        return fileUrls;
    }

    private MultipartFile resizeImage(MultipartFile originalFile, int width, int height) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Thumbnails.of(originalFile.getInputStream())
                    .size(width, height)
                    .outputFormat("jpg") // Ensure image format (if needed)
                    .toOutputStream(outputStream);

            return new MultipartFile() {
                @Override
                public String getName() {
                    return originalFile.getName();
                }

                @Override
                public String getOriginalFilename() {
                    return originalFile.getOriginalFilename();
                }

                @Override
                public String getContentType() {
                    return "image/jpeg";
                }

                @Override
                public boolean isEmpty() {
                    return outputStream.size() == 0;
                }

                @Override
                public long getSize() {
                    return outputStream.size();
                }

                @Override
                public byte[] getBytes() throws IOException {
                    return outputStream.toByteArray();
                }

                @Override
                public InputStream getInputStream() {
                    return new ByteArrayInputStream(outputStream.toByteArray());
                }

                @Override
                public void transferTo(File dest) throws IOException, IllegalStateException {
                    try (FileOutputStream fos = new FileOutputStream(dest)) {
                        fos.write(outputStream.toByteArray());
                    }
                }
            };
        } catch (IOException e) {
            log.error("Error resizing image: ", e);
            throw new RuntimeException("Failed to resize image.", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }
        File fileObj = convertMultiPartFileToFile(file);
        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            s3Client.putObject(new PutObjectRequest(bucketName, fileName, fileObj));
            return s3Client.getUrl(bucketName, fileName).toString();
        } finally {
            fileObj.delete();
        }
    }

    private File convertMultiPartFileToFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot convert an empty or null file");
        }

        File convertedFile = new File(file.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
            fos.write(file.getBytes());
        } catch (IOException e) {
            log.error("Error converting multipartFile to file", e);
            throw new RuntimeException("Failed to convert file", e);
        }
        return convertedFile;
    }

    public String deleteFile(String fileName) {
        try {
            boolean exists = s3Client.doesObjectExist(bucketName, fileName);
            if (exists) {
                s3Client.deleteObject(bucketName, fileName);
                return fileName + " removed from S3 successfully.";
            } else {
                log.error("File does not exist: {}", fileName);
                return "File does not exist on S3.";
            }
        } catch (SdkClientException e) {
            log.error("Error occurred while deleting file from S3: {}", e.getMessage());
            return "Error occurred while deleting file from S3.";
        }
    }

    public S3Object getObject(String fileName) {
        return s3Client.getObject(new GetObjectRequest(bucketName, fileName));
    }
}
