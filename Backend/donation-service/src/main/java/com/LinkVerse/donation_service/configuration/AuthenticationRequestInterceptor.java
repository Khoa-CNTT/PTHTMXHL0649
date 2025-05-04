package com.LinkVerse.donation_service.configuration;

import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AuthenticationRequestInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes servletRequestAttributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        // Lấy header Authorization từ request gốc
        String authHeader = servletRequestAttributes.getRequest().getHeader("Authorization");

        log.info("Header: {}", authHeader);

        // Nếu có Authorization header thì thêm vào yêu cầu của Feign
        if (StringUtils.hasText(authHeader)) {
            template.header("Authorization", authHeader);
        }
    }
}
