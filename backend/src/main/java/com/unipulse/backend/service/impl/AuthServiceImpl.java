package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.dto.AuthResponse;
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
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setProvider(AuthProvider.LOCAL);

        User savedUser = userRepository.save(user);

        Notification registerNotification = new Notification();
        registerNotification.setTitle("Account Created");
        registerNotification.setMessage("Your account was created successfully.");
        registerNotification.setRead(false);
        registerNotification.setUser(savedUser);
        notificationRepository.save(registerNotification);

        try {
            emailService.sendSimpleEmail(
                    savedUser.getEmail(),
                    "UniPulse Registration Successful",
                    "Hello " + savedUser.getFullName() + ", your account was created successfully."
            );
        } catch (Exception e) {
            System.out.println("Registration email failed: " + e.getMessage());
        }

        return new AuthResponse(
                "User registered successfully",
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                null
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        Notification loginNotification = new Notification();
        loginNotification.setTitle("Login Successful");
        loginNotification.setMessage("Login completed successfully.");
        loginNotification.setRead(false);
        loginNotification.setUser(user);
        notificationRepository.save(loginNotification);

        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "UniPulse Login Alert",
                    "Hello " + user.getFullName() + ", your login was completed successfully."
            );
        } catch (Exception e) {
            System.out.println("Login email failed: " + e.getMessage());
        }

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

        return new AuthResponse(
                "Login successful",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                jwtToken
        );
    }
}