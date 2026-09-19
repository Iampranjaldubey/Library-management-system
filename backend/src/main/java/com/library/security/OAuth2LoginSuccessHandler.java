package com.library.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.dto.response.AuthResponse;
import com.library.entity.AuthProvider;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.repository.UserRepository;
import com.library.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenCookieFactory refreshCookieFactory;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        log.info("OAuth2 login successful for email: {}", email);

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // New user registration via OAuth2
            log.info("Registering new user from OAuth2: {}", email);
            
            Long maxId = userRepository.findMaxId();
            long nextNum = (maxId != null ? maxId : 0) + 1;
            String memberId = String.format("LIB-%05d", nextNum);

            User newUser = User.builder()
                    .email(email)
                    .name(name != null ? name : "Unknown")
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // dummy password
                    .role(Role.USER)
                    .provider(AuthProvider.GOOGLE)
                    .emailVerified(true)
                    .active(true)
                    .memberId(memberId)
                    .build();
            
            return userRepository.save(newUser);
        });

        // Generate tokens
        String token = jwtUtil.generateToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        
        // Build AuthResponse
        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
                
        // Create cookie
        ResponseCookie cookie = refreshCookieFactory.create(refreshToken);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // We need to pass the access token and user info to the frontend
        // We will redirect to a special frontend callback route
        String userJson = objectMapper.writeValueAsString(authResponse);
        String encodedUser = URLEncoder.encode(userJson, StandardCharsets.UTF_8);
        
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth-callback")
                .queryParam("token", token)
                .queryParam("user", encodedUser)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
