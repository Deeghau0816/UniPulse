package com.unipulse.backend.config;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.UserJwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final UserJwtService userJwtService;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     NotificationRepository notificationRepository,
                                     UserJwtService userJwtService) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.userJwtService = userJwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        org.springframework.security.core.Authentication authentication)
            throws IOException, ServletException {

        org.springframework.security.oauth2.core.user.OAuth2User oauth2User =
                (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();

        String email = (String) oauth2User.getAttributes().get("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OAuth user not found"));

        Notification loginNotification = new Notification();
        loginNotification.setTitle("Google Login Successful");
        loginNotification.setMessage("Your Google login was completed successfully.");
        loginNotification.setRead(false);
        loginNotification.setUser(user);
        notificationRepository.save(loginNotification);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String jwtToken = userJwtService.generateToken(
                userDetails,
                user.getId(),
                user.getRole().name()
        );

        String redirectUrl = "http://localhost:5173/oauth2/success?token="
                + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}