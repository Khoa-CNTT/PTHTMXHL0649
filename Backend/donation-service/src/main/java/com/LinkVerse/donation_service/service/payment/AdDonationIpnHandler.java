package com.LinkVerse.donation_service.service.payment;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.LinkVerse.donation_service.constant.VNPayParams;
import com.LinkVerse.donation_service.constant.VnpIpnResponseConst;
import com.LinkVerse.donation_service.dto.response.IpnResponse;
import com.LinkVerse.donation_service.exception.AppException;
import com.LinkVerse.donation_service.service.AdDonationService;
import com.LinkVerse.donation_service.service.TelegramServiceAdmin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdDonationIpnHandler {

    private final VNPayService vnPayService;
    private final AdDonationService adDonationService;
    private final TelegramServiceAdmin telegramServiceAdmin;

    public IpnResponse process(Map<String, String> params) {
        if (!vnPayService.verifyIpn(params)) {
            return VnpIpnResponseConst.SIGNATURE_FAILED;
        }

        var txnRef = params.get(VNPayParams.TXN_REF);
        var vnpResponseCode = params.get("vnp_ResponseCode");
        var vnpPayDate = params.get("vnp_PayDate");
        String formattedTime = "-";
        if (vnpPayDate != null && vnpPayDate.length() == 14) {
            var formatterIn = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            var formatterOut = DateTimeFormatter.ofPattern("dd/MM/yyyy - HH:mm");
            var payDateTime = LocalDateTime.parse(vnpPayDate, formatterIn);
            formattedTime = payDateTime.format(formatterOut);
        }

        if ("00".equals(vnpResponseCode)) {
            try {
                adDonationService.markDonated(txnRef);
                telegramServiceAdmin.send("✅ Thanh toán ad donation thành công!\n" + "🧾 Mã giao dịch: "
                        + txnRef + "\n" + "🕒 Thời gian: "
                        + formattedTime);
                return VnpIpnResponseConst.SUCCESS;
            } catch (AppException e) {
                telegramServiceAdmin.send("❌ Lỗi xử lý ad donation " + txnRef + ": " + e.getMessage());
                return VnpIpnResponseConst.ORDER_NOT_FOUND;
            }
        } else {
            telegramServiceAdmin.send("⚠️ Thanh toán ad donation thất bại!\n" + "🧾 Mã giao dịch: "
                    + txnRef + "\n" + "❗ Mã lỗi: "
                    + vnpResponseCode + "\n" + "🕒 Thời gian: "
                    + formattedTime);
            return VnpIpnResponseConst.UNKNOWN_ERROR;
        }
    }
}
