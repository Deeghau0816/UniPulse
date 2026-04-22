package com.unipulse.backend.config;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.model.AuthProvider;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.EmailService;
import com.unipulse.backend.service.UserJwtService;
import com.unipulse.backend.util.NameUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final UserJwtService userJwtService;
    private final EmailService emailService;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     NotificationRepository notificationRepository,
                                     UserJwtService userJwtService,
                                     EmailService emailService) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.userJwtService = userJwtService;
        this.emailService = emailService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        org.springframework.security.oauth2.core.user.OAuth2User oauth2User =
                (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();

        String email = (String) oauth2User.getAttributes().get("email");
        String fullName = (String) oauth2User.getAttributes().get("name");
        String givenName = (String) oauth2User.getAttributes().get("given_name");
        String familyName = (String) oauth2User.getAttributes().get("family_name");
        String picture = (String) oauth2User.getAttributes().get("picture");

        String[] splitName = NameUtils.splitFullName(fullName);
        String firstName = (givenName != null && !givenName.isBlank()) ? givenName : splitName[0];
        String lastName = (familyName != null && !familyName.isBlank()) ? familyName : splitName[1];

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email not found from OAuth2");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        boolean isNewUser = false;

        if (user == null) {
            user = new User();
            user.setEmail(email.trim().toLowerCase());
            user.setFirstName(!firstName.isBlank() ? firstName : "OAuth");
            user.setLastName(lastName);
            user.setPassword(UUID.randomUUID().toString());
            user.setRole(Role.STUDENT);
            user.setProvider(AuthProvider.GOOGLE);
            user.setProfileImage(picture);
            user.setProfileCompleted(false);
            user = userRepository.save(user);
            isNewUser = true;
        } else {
            if (user.getProvider() == null) {
                user.setProvider(AuthProvider.GOOGLE);
            }
            if (user.getFirstName() == null || user.getFirstName().isBlank()) {
                user.setFirstName(!firstName.isBlank() ? firstName : user.getEmail());
            }
            if (user.getLastName() == null || user.getLastName().isBlank()) {
                user.setLastName(lastName);
            }
            if (picture != null && !picture.isBlank()) {
                user.setProfileImage(picture);
            }
            user = userRepository.save(user);
        }

        Notification loginNotification = new Notification();
        loginNotification.setTitle(isNewUser ? "Google Account Created" : "Google Login Successful");
        loginNotification.setMessage(
                isNewUser
                        ? "Your UniPulse account was created successfully using Google."
                        : "Your Google login was completed successfully."
        );
        loginNotification.setRead(false);
        loginNotification.setUser(user);
        notificationRepository.save(loginNotification);

        try {
            if (isNewUser) {
                emailService.sendSimpleEmail(
                        user.getEmail(),
                        "Welcome to UniPulse",
                        "Hello " + user.getFullName() + ", your UniPulse account was created successfully using Google."
                );
            } else {
                emailService.sendSimpleEmail(
                        user.getEmail(),
                        "UniPulse Google Login Alert",
                        "Hello " + user.getFullName() + ", your Google login was completed successfully."
                );
            }
        } catch (Exception e) {
            System.out.println("Google OAuth email failed: " + e.getMessage());
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String jwtToken = userJwtService.generateToken(userDetails, user);

        String redirectUrl = "http://localhost:5174/oauth2/success?token="
                + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}