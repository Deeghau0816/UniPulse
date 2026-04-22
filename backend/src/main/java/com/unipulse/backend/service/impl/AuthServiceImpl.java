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
    public AuthResponse register(RegisterRequest request) {
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
        saveNotification(savedUser, "Account Created", "Your account was created successfully.");

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
    public AuthResponse adminRegister(RegisterRequest request) {
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
        saveNotification(savedUser, "Admin Account Created", "Your admin account was created successfully.");

        String jwtToken = generateTokenForUser(savedUser);
        return new AuthResponse(jwtToken, UserMapper.toDto(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = authenticate(request);

        saveNotification(user, "Login Successful", "Login completed successfully.");

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
    public AuthResponse adminLogin(LoginRequest request) {
        User user = authenticate(request);

        if (user.getRole() != Role.TECHNICIAN && user.getRole() != Role.SYSTEM_ADMIN) {
            throw new RuntimeException("Access denied. Only Technician or System Admin can log in here.");
        }

        saveNotification(user, "Admin Login Successful", "Admin login completed successfully.");

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

    private void saveNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
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