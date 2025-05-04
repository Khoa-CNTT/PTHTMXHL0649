package com.LinkVerse.donation_service.service;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.constant.DefaultValue;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.exception.ErrorCode;
import com.LinkVerse.donation_service.util.EncodingUtil;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CryptoService {
    Mac mac;
    String secretKey;

    public CryptoService(@Value("${payment.vnPay.donation.secretKey}") String secretKey)
            throws NoSuchAlgorithmException {
        this.secretKey = secretKey;
        this.mac = Mac.getInstance(DefaultValue.HMAC_SHA512);
    }

    @PostConstruct
    void init() throws InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), DefaultValue.HMAC_SHA512);
        mac.init(secretKeySpec);
    }

    public String sign(String data) {
        try {
            return EncodingUtil.toHexString(mac.doFinal(data.getBytes()));
        } catch (Exception e) {
            throw new AppException(ErrorCode.VNPAY_SIGNING_FAILED);
        }
    }
}
