package com.LinkVerse.identity.controller.report;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.identity.dto.response.UserResponse;
import com.LinkVerse.identity.service.report.ReportService;

import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@RestController
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    @GetMapping("/report/users")
    public ResponseEntity<byte[]> generateUserReport(Authentication authentication) throws Exception {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }

        List<UserResponse> data = reportService.getUserReportData();
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);

        InputStream reportStream = new ClassPathResource("reports/user_report.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

        Map<String, Object> parameters = new HashMap<>();
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        byte[] pdfReport = JasperExportManager.exportReportToPdf(jasperPrint);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "user_report.pdf");

        return ResponseEntity.ok().headers(headers).body(pdfReport);
    }
}
