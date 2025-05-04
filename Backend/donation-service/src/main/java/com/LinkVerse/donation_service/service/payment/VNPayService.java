package com.LinkVerse.donation_service.service.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.constant.Currency;
import com.LinkVerse.donation_service.constant.Symbol;
import com.LinkVerse.donation_service.constant.VNPayParams;
import com.LinkVerse.donation_service.dto.request.InitPaymentRequest;
import com.LinkVerse.donation_service.dto.response.InitPaymentResponse;
import com.LinkVerse.donation_service.service.CryptoService;
import com.LinkVerse.donation_service.util.DateUtil;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class VNPayService {

    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "190000";
    public static final long DEFAULT_MULTIPLIER = 100L;

    @Value("${payment.vnPay.donation.tmnCode}")
    private String donationTmnCode;

    @Value("${payment.vnPay.donation.url}")
    private String donationInitPaymentPrefixUrl;

    @Value("${payment.vnPay.donation.returnUrl}")
    private String donationReturnUrlFormat;

    @Value("${payment.vnPay.donation.timeOut}")
    private Integer donationPaymentTimeout;

    @Value("${payment.vnPay.adDonation.tmnCode}")
    private String adDonationTmnCode;

    @Value("${payment.vnPay.adDonation.url}")
    private String adDonationInitPaymentPrefixUrl;

    @Value("${payment.vnPay.adDonation.returnUrl}")
    private String adDonationReturnUrlFormat;

    @Value("${payment.vnPay.adDonation.timeOut}")
    private Integer adDonationPaymentTimeout;

    private final CryptoService cryptoService;

    public InitPaymentResponse init(InitPaymentRequest request) {
        boolean isAdDonation = request.isAdDonation();
        String tmnCode = isAdDonation ? adDonationTmnCode : donationTmnCode;
        String initPaymentPrefixUrl = isAdDonation ? adDonationInitPaymentPrefixUrl : donationInitPaymentPrefixUrl;
        String returnUrlFormat = isAdDonation ? adDonationReturnUrlFormat : donationReturnUrlFormat;
        Integer paymentTimeout = isAdDonation ? adDonationPaymentTimeout : donationPaymentTimeout;

        var amount = request.getAmount() * DEFAULT_MULTIPLIER;
        var txnRef = request.getTxnRef();
        var returnUrl = String.format(returnUrlFormat, txnRef);
        var vnCalendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        var createdDate = DateUtil.formatVnTime(vnCalendar);
        vnCalendar.add(Calendar.MINUTE, paymentTimeout);
        var expiredDate = DateUtil.formatVnTime(vnCalendar);

        var ipAddress = request.getIpAddress();
        var orderInfo = buildPaymentDetail(request);
        var requestId = request.getRequestId();

        Map<String, String> params = new HashMap<>();

        params.put(VNPayParams.VERSION, VERSION);
        params.put(VNPayParams.COMMAND, COMMAND);
        params.put(VNPayParams.TMN_CODE, tmnCode);
        params.put(VNPayParams.AMOUNT, String.valueOf(amount));
        params.put(VNPayParams.CURRENCY, Currency.VND.getValue());
        params.put(VNPayParams.TXN_REF, txnRef);
        params.put(VNPayParams.RETURN_URL, returnUrl);
        params.put(VNPayParams.CREATED_DATE, createdDate);
        params.put(VNPayParams.EXPIRE_DATE, expiredDate);
        params.put(VNPayParams.IP_ADDRESS, ipAddress);
        params.put(VNPayParams.LOCALE, com.LinkVerse.donation_service.constant.Locale.VIETNAM.getCode());
        params.put(VNPayParams.ORDER_INFO, orderInfo);
        params.put(VNPayParams.ORDER_TYPE, ORDER_TYPE);

        var initPaymentUrl = buildInitPaymentUrl(params, initPaymentPrefixUrl);
        log.debug("[request_id={}] Init payment url: {}", requestId, initPaymentUrl);
        return InitPaymentResponse.builder().vnpUrl(initPaymentUrl).build();
    }

    public boolean verifyIpn(Map<String, String> params) {
        var reqSecureHash = params.get(VNPayParams.SECURE_HASH);
        params.remove(VNPayParams.SECURE_HASH);
        params.remove(VNPayParams.SECURE_HASH_TYPE);
        var hashPayload = new StringBuilder();
        var fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        var itr = fieldNames.iterator();
        while (itr.hasNext()) {
            var fieldName = itr.next();
            var fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashPayload.append(fieldName);
                hashPayload.append(Symbol.EQUAL);
                hashPayload.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashPayload.append(Symbol.AND);
                }
            }
        }

        var secureHash = cryptoService.sign(hashPayload.toString());
        return secureHash.equals(reqSecureHash);
    }

    private String buildPaymentDetail(InitPaymentRequest request) {
        return String.format(
                "Thanh toan %s %s", request.isAdDonation() ? "ad donation" : "donate", request.getTxnRef());
    }

    @SneakyThrows
    private String buildInitPaymentUrl(Map<String, String> params, String initPaymentPrefixUrl) {
        var hashPayload = new StringBuilder();
        var query = new StringBuilder();
        var fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        var itr = fieldNames.iterator();
        while (itr.hasNext()) {
            var fieldName = itr.next();
            var fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashPayload.append(fieldName);
                hashPayload.append(Symbol.EQUAL);
                hashPayload.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append(Symbol.EQUAL);
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append(Symbol.AND);
                    hashPayload.append(Symbol.AND);
                }
            }
        }

        var secureHash = cryptoService.sign(hashPayload.toString());
        query.append("&vnp_SecureHash=");
        query.append(secureHash);

        return initPaymentPrefixUrl + "?" + query;
    }
}
