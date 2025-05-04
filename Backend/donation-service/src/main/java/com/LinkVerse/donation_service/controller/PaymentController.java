package com.LinkVerse.donation_service.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import com.LinkVerse.donation_service.dto.response.IpnResponse;
import com.LinkVerse.donation_service.service.DonationService;
import com.LinkVerse.donation_service.service.payment.VNPayIpnHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VNPayIpnHandler ipnHandler;
    private final DonationService donationService;

    @GetMapping("/vnpay_ipn")
    IpnResponse processIpn(HttpServletRequest request, @RequestParam Map<String, String> params) {
        log.info("[VNPay IPN] Request URL: {}", request.getRequestURL());
        log.info("[VNPay IPN] Query String: {}", request.getQueryString());
        log.info("[VNPay IPN] Params map: {}", params);

        return ipnHandler.process(params);
    }

    @GetMapping("/{id}/vn-pay-callback")
    public RedirectView payCallbackHandler(
            @PathVariable("id") String donationId, @RequestParam Map<String, String> params) {

        log.info("[VNPay Callback] donationId={}, params={}", donationId, params);

        boolean success = "00".equals(params.get("vnp_ResponseCode"));
        if (success) {
            donationService.markDonated(donationId);
            return new RedirectView("http://localhost:5173/fundraisers/payment-success");
        } else {
            return new RedirectView("http://localhost:5173/fundraisers/payment-failed");
        }
    }

    //    @GetMapping("/{id}/vn-pay-callback")
    //    public ApiResponse<PaymentDTO.VNPayResponse> payCallbackHandler(
    //            @PathVariable("id") String donationId,
    //            @RequestParam Map<String, String> params) {
    //
    //        log.info("[VNPay Callback received] donationId={}, params={}", donationId, params);
    //
    //        boolean success = "00".equals(params.get("vnp_ResponseCode"));
    //        if (success) {
    //            donationService.markDonated(donationId);
    //            return new ApiResponse<>(
    //                    HttpStatus.OK.value(),
    //                    "Success",
    //                    new PaymentDTO.VNPayResponse("00", "Success", "")
    //            );
    //        } else {
    //            return new ApiResponse<>(
    //                    HttpStatus.BAD_REQUEST.value(),
    //                    "Payment failed",
    //                    null
    //            );
    //        }
    //    }
}
