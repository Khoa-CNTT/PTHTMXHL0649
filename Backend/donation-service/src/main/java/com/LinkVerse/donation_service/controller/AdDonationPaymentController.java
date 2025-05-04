package com.LinkVerse.donation_service.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import com.LinkVerse.donation_service.dto.response.IpnResponse;
import com.LinkVerse.donation_service.service.payment.AdDonationIpnHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/ad-payments")
@RequiredArgsConstructor
@Slf4j
public class AdDonationPaymentController {

    private final AdDonationIpnHandler ipnHandler;

    @GetMapping("/vnpay_ipn")
    public IpnResponse processIpn(HttpServletRequest request, @RequestParam Map<String, String> params) {
        log.info("[VNPay IPN] Request URL: {}", request.getRequestURL());
        log.info("[VNPay IPN] Query String: {}", request.getQueryString());
        log.info("[VNPay IPN] Params map: {}", params);

        return ipnHandler.process(params);
    }

    @GetMapping("/{id}/vn-pay-callback")
    public RedirectView payCallbackHandler(
            @PathVariable("id") String adDonationId, @RequestParam Map<String, String> params) {
        log.info("[VNPay Callback] adDonationId={}, params={}", adDonationId, params);

        boolean success = "00".equals(params.get("vnp_ResponseCode"));
        if (success) {
            ipnHandler.process(params);
            return new RedirectView("http://localhost:5173/ad-campaigns/payment-success");
        } else {
            return new RedirectView("http://localhost:5173/ad-campaigns/payment-failed");
        }
    }
}
