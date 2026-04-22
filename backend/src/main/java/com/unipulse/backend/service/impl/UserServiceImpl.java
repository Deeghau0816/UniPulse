package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.RoleRequestRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.dto.RoleRequestCreateRequest;
import com.unipulse.backend.dto.RoleRequestResponse;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.RoleRequest;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.EmailService;
import com.unipulse.backend.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRequestRepository roleRequestRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRequestRepository roleRequestRepository,
                           NotificationRepository notificationRepository,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRequestRepository = roleRequestRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional
    public RoleRequestResponse createRoleRequest(Long userId, RoleRequestCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getRequestedRole() == null) {
            throw new RuntimeException("Requested role is required");
        }

        if (user.getRole() == request.getRequestedRole()) {
            throw new RuntimeException("You already have this role");
        }

        RoleRequest roleRequest = new RoleRequest();
        roleRequest.setUser(user);
        roleRequest.setCurrentRole(user.getRole());
        roleRequest.setRequestedRole(request.getRequestedRole());
        roleRequest.setReason(request.getReason());
        roleRequest.setStatus(RoleRequest.Status.PENDING);
        roleRequest.setCreatedAt(LocalDateTime.now());

        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);

        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {
            Notification adminNotification = new Notification();
            adminNotification.setTitle("Role Change Request");
            adminNotification.setMessage(
                    user.getFullName() + " requested role change from " +
                    user.getRole().name() + " to " + request.getRequestedRole().name() + "."
            );
            adminNotification.setRead(false);
            adminNotification.setCreatedAt(LocalDateTime.now());
            adminNotification.setUser(admin);
            notificationRepository.save(adminNotification);

            try {
                emailService.sendSimpleEmail(
                        admin.getEmail(),
                        "New Role Change Request",
                        "User " + user.getFullName() + " (" + user.getEmail() + ") requested role change from " +
                                user.getRole().name() + " to " + request.getRequestedRole().name() +
                                (request.getReason() != null && !request.getReason().isBlank()
                                        ? "\nReason: " + request.getReason()
                                        : "")
                );
            } catch (Exception e) {
                System.out.println("Admin email failed: " + e.getMessage());
            }
        }

        Notification userNotification = new Notification();
        userNotification.setTitle("Role Request Submitted");
        userNotification.setMessage("Your request for role " + request.getRequestedRole().name() + " was submitted.");
        userNotification.setRead(false);
        userNotification.setCreatedAt(LocalDateTime.now());
        userNotification.setUser(user);
        notificationRepository.save(userNotification);

        return RoleRequestResponse.fromEntity(savedRequest);
    }

    @Override
    public List<RoleRequestResponse> getMyRoleRequests(Long userId) {
        return roleRequestRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(RoleRequestResponse::fromEntity)
                .toList();
    }

    @Override
    public List<RoleRequestResponse> getAllRoleRequests() {
        return roleRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(RoleRequestResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public RoleRequestResponse approveRoleRequest(Long requestId) {
        RoleRequest roleRequest = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Role request not found"));

        if (roleRequest.getStatus() != RoleRequest.Status.PENDING) {
            throw new RuntimeException("This request has already been reviewed");
        }

        User user = roleRequest.getUser();
        user.setRole(roleRequest.getRequestedRole());
        userRepository.save(user);

        roleRequest.setStatus(RoleRequest.Status.APPROVED);
        roleRequest.setReviewedAt(LocalDateTime.now());
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);

        Notification userNotification = new Notification();
        userNotification.setTitle("Role Request Approved");
        userNotification.setMessage("Your role request has been approved. Your new role is " + user.getRole().name() + ".");
        userNotification.setRead(false);
        userNotification.setCreatedAt(LocalDateTime.now());
        userNotification.setUser(user);
        notificationRepository.save(userNotification);

        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "Role Request Approved",
                    "Hello " + user.getFullName() + ", your role request has been approved. Your new role is " +
                            user.getRole().name() + "."
            );
        } catch (Exception e) {
            System.out.println("Approval email failed: " + e.getMessage());
        }

        return RoleRequestResponse.fromEntity(savedRequest);
    }

    @Override
    @Transactional
    public RoleRequestResponse rejectRoleRequest(Long requestId) {
        RoleRequest roleRequest = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Role request not found"));

        if (roleRequest.getStatus() != RoleRequest.Status.PENDING) {
            throw new RuntimeException("This request has already been reviewed");
        }

        roleRequest.setStatus(RoleRequest.Status.REJECTED);
        roleRequest.setReviewedAt(LocalDateTime.now());
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);

        User user = roleRequest.getUser();

        Notification userNotification = new Notification();
        userNotification.setTitle("Role Request Rejected");
        userNotification.setMessage("Your role request has been rejected.");
        userNotification.setRead(false);
        userNotification.setCreatedAt(LocalDateTime.now());
        userNotification.setUser(user);
        notificationRepository.save(userNotification);

        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "Role Request Rejected",
                    "Hello " + user.getFullName() + ", your role request has been rejected."
            );
        } catch (Exception e) {
            System.out.println("Rejection email failed: " + e.getMessage());
        }

        return RoleRequestResponse.fromEntity(savedRequest);
    }
}
