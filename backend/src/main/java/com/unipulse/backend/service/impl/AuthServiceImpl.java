package com.unipulse.backend.service.impl;

import com.unipulse.backend.Mapper.UserMapper;
import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.dto.AuthResponse;
import com.unipulse.backend.dto.CompleteProfileRequest;
import com.unipulse.backend.dto.LoginRequest;
import com.unipulse.backend.dto.RegisterRequest;
import com.unipulse.backend.model.AuthProvider;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.AuthService;
import com.unipulse.backend.service.EmailService;
import com.unipulse.backend.service.UserJwtService;
import com.unipulse.backend.util.NotificationMessageUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserJwtService userJwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService,
                           UserJwtService userJwtService) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.userJwtService = userJwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request, String userAgent) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedSliitId = request.getSliitId().trim();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        if (userRepository.findBySliitId(normalizedSliitId).isPresent()) {
            throw new RuntimeException("SLIIT ID is already registered");
        }

        Role selectedRole = parseAllowedSignupRole(request.getRole());

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setSliitId(normalizedSliitId);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(selectedRole);
        user.setProvider(AuthProvider.LOCAL);
        user.setProfileCompleted(true);

        User savedUser = userRepository.save(user);
        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                savedUser,
                "Account Created",
                "You registered with a device (" + NotificationMessageUtils.describeDevice(userAgent) + ") on "
                        + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );

        try {
            emailService.sendSimpleEmail(
                    savedUser.getEmail(),
                    "UniPulse Registration Successful",
                    "Hello " + savedUser.getFullName() + ", your account was created successfully."
            );
        } catch (Exception e) {
            System.out.println("Registration email failed: " + e.getMessage());
        }

        String jwtToken = generateTokenForUser(savedUser);
        return new AuthResponse(jwtToken, UserMapper.toDto(savedUser));
    }

    @Override
    public AuthResponse adminRegister(RegisterRequest request, String userAgent) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        Role selectedRole = parseAdminSignupRole(request.getRole());

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setSliitId("ADMIN-" + System.currentTimeMillis());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(selectedRole);
        user.setProvider(AuthProvider.LOCAL);
        user.setProfileCompleted(true);

        User savedUser = userRepository.save(user);
        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                savedUser,
                "Admin Account Created",
                "You registered an admin account with a device (" + NotificationMessageUtils.describeDevice(userAgent)
                        + ") on " + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );

        String jwtToken = generateTokenForUser(savedUser);
        return new AuthResponse(jwtToken, UserMapper.toDto(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request, String userAgent) {
        User user = authenticate(request);

        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                user,
                "Login Successful",
                "You logged in with a device (" + NotificationMessageUtils.describeDevice(userAgent) + ") on "
                        + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );

        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "UniPulse Login Alert",
                    "Hello " + user.getFullName() + ", your login was completed successfully."
            );
        } catch (Exception e) {
            System.out.println("Login email failed: " + e.getMessage());
        }

        String jwtToken = generateTokenForUser(user);
        return new AuthResponse(jwtToken, UserMapper.toDto(user));
    }

    @Override
    public AuthResponse adminLogin(LoginRequest request, String userAgent) {
        User user = authenticate(request);

        if (user.getRole() != Role.TECHNICIAN && user.getRole() != Role.SYSTEM_ADMIN) {
            throw new RuntimeException("Access denied. Only Technician or System Admin can log in here.");
        }

        LocalDateTime eventTime = LocalDateTime.now();
        saveNotification(
                user,
                "Admin Login Successful",
                "You logged in to the admin portal with a device ("
                        + NotificationMessageUtils.describeDevice(userAgent) + ") on "
                        + NotificationMessageUtils.formatEventTimestamp(eventTime) + ".",
                eventTime
        );

        String jwtToken = generateTokenForUser(user);
        return new AuthResponse(jwtToken, UserMapper.toDto(user));
    }

    @Override
    public AuthResponse completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String sliitId = request.getSliitId().trim();

        userRepository.findBySliitId(sliitId)
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new RuntimeException("SLIIT ID is already registered");
                });

        Role selectedRole = parseAllowedSignupRole(request.getRole());

        user.setSliitId(sliitId);
        user.setRole(selectedRole);
        user.setProfileCompleted(true);

        User savedUser = userRepository.save(user);
        String jwtToken = generateTokenForUser(savedUser);

        return new AuthResponse(jwtToken, UserMapper.toDto(savedUser));
    }

    private User authenticate(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not registered"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    private Role parseAllowedSignupRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            throw new RuntimeException("Role is required");
        }

        Role role;
        try {
            role = Role.valueOf(rawRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid role");
        }

        if (role != Role.STUDENT && role != Role.ACADEMIC && role != Role.NON_ACADEMIC) {
            throw new RuntimeException("Only STUDENT, ACADEMIC, or NON_ACADEMIC can be selected during signup");
        }

        return role;
    }

    private Role parseAdminSignupRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            throw new RuntimeException("Role is required");
        }

        Role role;
        try {
            role = Role.valueOf(rawRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid role");
        }

        if (role != Role.TECHNICIAN && role != Role.SYSTEM_ADMIN) {
            throw new RuntimeException("Only TECHNICIAN or SYSTEM_ADMIN can be selected during admin signup");
        }

        return role;
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

    private String generateTokenForUser(User user) {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        return userJwtService.generateToken(userDetails, user);
    }
}