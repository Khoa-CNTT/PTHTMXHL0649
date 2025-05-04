package com.LinkVerse.post.service;

import com.LinkVerse.post.exception.RekognitionException;
import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.model.*;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.util.IOUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RekognitionService {

    private final AmazonRekognition rekognitionClient;

    public boolean isImageSafe(S3Object s3Object) {
        ByteBuffer imageBytes;

        try (S3ObjectInputStream inputStream = s3Object.getObjectContent()) {
            imageBytes = ByteBuffer.wrap(IOUtils.toByteArray(inputStream));
        } catch (Exception e) {
            log.error("Failed to read image from S3 object", e);
            throw new RekognitionException("Failed to read image from S3 object", e);
        }

        DetectModerationLabelsRequest request = new DetectModerationLabelsRequest()
                .withImage(new Image().withBytes(imageBytes));

        try {
            DetectModerationLabelsResult result = rekognitionClient.detectModerationLabels(request);
            List<ModerationLabel> labels = result.getModerationLabels();

            for (ModerationLabel label : labels) {
                if (label.getConfidence() > 75) {
                    log.warn("Detected unsafe content: {} with confidence: {}", label.getName(), label.getConfidence());
                    return false;
                }
            }
        } catch (AmazonRekognitionException e) {
            log.error("Error calling Rekognition service: {}", e.getMessage(), e);
            throw new RekognitionException("Error calling Rekognition service", e);
        }

        return true;
    }
}
