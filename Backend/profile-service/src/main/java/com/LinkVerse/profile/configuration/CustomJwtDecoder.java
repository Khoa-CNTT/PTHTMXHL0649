package com.LinkVerse.profile.configuration;

import java.text.ParseException;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import com.nimbusds.jwt.SignedJWT;

@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            return new Jwt(
                    token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    signedJWT.getJWTClaimsSet().getExpirationTime().toInstant(),
                    signedJWT.getHeader().toJSONObject(),
                    signedJWT.getJWTClaimsSet().getClaims());

        } catch (ParseException e) {
            throw new JwtException("Invalid token");
        }
    }
}
// Bỏ qua xác thực, vì lớp api đã xác thực -> thừa
//  @Value("${jwt.signerKey}")
//            private String signerKey;
//
//            @Autowired
//            private AutheticationService authenticationService;
//
//            private NimbusJwtDecoder nimbusJwtDecoder = null;
//
//            @Override
//            public Jwt decode(String token) throws JwtException {
//                try {
//                    var response = authenticationService.introspect(
//                            introspecRequest.builder()
//                                    .token(token)
//                                    .build());
//
//                    if (!response.isValid()) throw new JwtException("Token invalid");  //token khong h.le
//
//                } catch (JOSEException | ParseException e) {
//                    throw new JwtException(e.getMessage());
//                }
//
//                if (Objects.isNull(nimbusJwtDecoder)) {
//                    SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
//                    nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
//                            .macAlgorithm(MacAlgorithm.HS512)
//                            .build();
//                }
//
//                return nimbusJwtDecoder.decode(token);
//            }
