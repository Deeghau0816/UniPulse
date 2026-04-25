package com.unipulse.backend.config;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.model.AuthProvider;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.EmailService;
import com.unipulse.backend.service.UserJwtService;
import com.unipulse.backend.util.NotificationMessageUtils;
import com.unipulse.backend.util.NameUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
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

        HttpSession session = request.getSession(false);
        String oauthMode = session != null ? (String) session.getAttribute("oauth_mode") : "user-login";

        if (session != null) {
            session.removeAttribute("oauth_mode");
        }

        org.springframework.security.oauth2.core.user.OAuth2User oauth2User =
                (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();

        String email = (String) oauth2User.getAttributes().get("email");
        String fullName = (String) oauth2User.getAttributes().get("name");
        String givenName = (String) oauth2User.getAttributes().get("given_name");
        String familyName = (String) oauth2User.getAttributes().get("family_name");
        String picture = (String) oauth2User.getAttributes().get("picture");
        String userAgent = request.getHeader("User-Agent");

        if (email == null || email.isBlank()) {
          response.sendRedirect("http://localhost:5174/login?error=" +
                  URLEncoder.encode("Google account email not found.", StandardCharsets.UTF_8));
          return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        String[] splitName = NameUtils.splitFullName(fullName);
        String firstName = (givenName != null && !givenName.isBlank()) ? givenName : splitName[0];
        String lastName = (familyName != null && !familyName.isBlank()) ? familyName : splitName[1];

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        switch (oauthMode) {
            case "user-login" -> handleUserLogin(response, user, firstName, lastName, picture, userAgent);
            case "user-register" -> handleUserRegister(response, normalizedEmail, user, firstName, lastName, picture, userAgent);
            case "admin-login" -> handleAdminLogin(response, user, firstName, lastName, picture, userAgent);
            case "admin-register" -> handleAdminRegister(response, normalizedEmail, user, firstName, lastName, picture, userAgent);
            default -> handleUserLogin(response, user, firstName, lastName, picture, userAgent);
        }
    }

    private void handleUserLogin(HttpServletResponse response,
                                 User user,
                                 String firstName,
                                 String lastName,
                                 String picture,
                                 String userAgent) throws IOException {
        if (user == null) {
            response.sendRedirect("http://localhost:5174/register?error=" +
                    URLEncoder.encode("No account found for this Google email. Please register first.", StandardCharsets.UTF_8));
            return;
        }

        syncOAuthDetails(user, firstName, lastName, picture);
        user = userRepository.save(user);

        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                user,
                "Login Successful",
                "You logged in with a device (" + NotificationMessageUtils.describeDevice(userAgent) + ") on "
                        + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );
        sendLoginEmail(user, "UniPulse Google Login Alert",
                "Hello " + user.getFullName() + ", your Google login was completed successfully.");

        String redirectTarget = (user.isProfileCompleted() && user.getSliitId() != null && !user.getSliitId().isBlank())
                ? "/"
                : "/complete-profile?after=home";

        response.sendRedirect(buildOAuthSuccessRedirect(user, redirectTarget));
    }

    private void handleUserRegister(HttpServletResponse response,
                                    String email,
                                    User user,
                                    String firstName,
                                    String lastName,
                                    String picture,
                                    String userAgent) throws IOException {
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFirstName(!firstName.isBlank() ? firstName : "OAuth");
            user.setLastName(lastName);
            user.setPassword(UUID.randomUUID().toString());
            user.setRole(Role.STUDENT);
            user.setProvider(AuthProvider.GOOGLE);
            user.setProfileImage(picture);
            user.setProfileCompleted(false);
            user.setSliitId(null);
            user = userRepository.save(user);

            LocalDateTime eventTime = LocalDateTime.now();
            saveNotification(
                    user,
                    "Account Created",
                    "You registered with a device (" + NotificationMessageUtils.describeDevice(userAgent) + ") on "
                            + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                    eventTime
            );
            sendLoginEmail(user, "UniPulse Google Registration",
                    "Hello " + user.getFullName() + ", complete your profile to finish registration.");

            response.sendRedirect(buildOAuthSuccessRedirect(user, "/complete-profile?after=login"));
            return;
        }

        syncOAuthDetails(user, firstName, lastName, picture);
        user = userRepository.save(user);

        if (!user.isProfileCompleted() || user.getSliitId() == null || user.getSliitId().isBlank()) {
            response.sendRedirect(buildOAuthSuccessRedirect(user, "/complete-profile?after=login"));
            return;
        }

        response.sendRedirect("http://localhost:5174/login?success=" +
                URLEncoder.encode("Account already exists. Please sign in.", StandardCharsets.UTF_8));
    }

    private void handleAdminLogin(HttpServletResponse response,
                                  User user,
                                  String firstName,
                                  String lastName,
                                  String picture,
                                  String userAgent) throws IOException {
        if (user == null || !isAdminUser(user)) {
            response.sendRedirect("http://localhost:5174/admin/login?error=" +
                    URLEncoder.encode("No authorized admin account found for this Google email.", StandardCharsets.UTF_8));
            return;
        }

        syncOAuthDetails(user, firstName, lastName, picture);
        user = userRepository.save(user);

        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                user,
                "Admin Login Successful",
                "You logged in to the admin portal with a device ("
                        + NotificationMessageUtils.describeDevice(userAgent) + ") on "
                        + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );
        response.sendRedirect(buildOAuthSuccessRedirect(user, "/admin/dashboard"));
    }

    private void handleAdminRegister(HttpServletResponse response,
                                     String email,
                                     User user,
                                     String firstName,
                                     String lastName,
                                     String picture,
                                     String userAgent) throws IOException {
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFirstName(!firstName.isBlank() ? firstName : "Admin");
            user.setLastName(lastName);
            user.setPassword(UUID.randomUUID().toString());
            user.setRole(Role.SYSTEM_ADMIN);
            user.setProvider(AuthProvider.GOOGLE);
            user.setProfileImage(picture);
            user.setProfileCompleted(true);
            user.setSliitId("ADMIN-GOOGLE-" + System.currentTimeMillis());
            user = userRepository.save(user);
        } else {
            syncOAuthDetails(user, firstName, lastName, picture);
            user.setRole(Role.SYSTEM_ADMIN);
            user.setProfileCompleted(true);
            if (user.getSliitId() == null || user.getSliitId().isBlank()) {
                user.setSliitId("ADMIN-GOOGLE-" + System.currentTimeMillis());
            }
            user = userRepository.save(user);
        }

        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                user,
                "Admin Account Created",
                "You registered an admin account with a device (" + NotificationMessageUtils.describeDevice(userAgent)
                        + ") on " + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );
        response.sendRedirect(buildOAuthSuccessRedirect(user, "/admin/dashboard"));
    }

    private void syncOAuthDetails(User user, String firstName, String lastName, String picture) {
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
    }

    private boolean isAdminUser(User user) {
        return user.getRole() == Role.TECHNICIAN || user.getRole() == Role.SYSTEM_ADMIN;
    }

    private void saveNotification(User user, String title, String message, LocalDateTime createdAt) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(createdAt);
        notification.setUser(user);
        notificationRepository.save(notification);
    }

    private void sendLoginEmail(User user, String subject, String body) {
        try {
            emailService.sendSimpleEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.out.println("Google OAuth email failed: " + e.getMessage());
        }
    }

    private String buildOAuthSuccessRedirect(User user, String redirectTarget) {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String jwtToken = userJwtService.generateToken(userDetails, user);

        return "http://localhost:5174/oauth2/success?token="
                + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8)
                + "&redirect="
                + URLEncoder.encode(redirectTarget, StandardCharsets.UTF_8);
    }
}