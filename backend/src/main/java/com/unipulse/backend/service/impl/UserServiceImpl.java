package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.NotificationRepository;
import com.unipulse.backend.Repository.RoleRequestRepository;
import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.dto.RoleRequestCreateRequest;
import com.unipulse.backend.dto.RoleRequestResponse;
import com.unipulse.backend.dto.UpdateUserRequest;
import com.unipulse.backend.model.Notification;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.RoleRequest;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.EmailService;
import com.unipulse.backend.service.UserService;
import com.unipulse.backend.util.NotificationMessageUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRequestRepository roleRequestRepository,
                           NotificationRepository notificationRepository,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRequestRepository = roleRequestRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
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
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    @Transactional
    public User updateMyProfile(String email, UpdateUserRequest request) {
        User user = getCurrentUser(email);

        String normalizedEmail = request.getEmail() == null ? user.getEmail() : request.getEmail().trim().toLowerCase();
        String normalizedSliitId = request.getSliitId() == null ? user.getSliitId() : request.getSliitId().trim();

        userRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Email is already registered");
                });

        if (normalizedSliitId != null && !normalizedSliitId.isBlank()) {
            userRepository.findBySliitId(normalizedSliitId)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new RuntimeException("SLIIT ID is already registered");
                    });
        }

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }

        user.setEmail(normalizedEmail);
        user.setSliitId(normalizedSliitId);

        if (request.getProfileImage() != null) {
            String trimmedProfileImage = request.getProfileImage().trim();
            user.setProfileImage(trimmedProfileImage.isBlank() ? null : trimmedProfileImage);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteMyProfile(String email) {
        User user = getCurrentUser(email);
        preserveRoleRequestsThenDeleteUser(user);
    }

    @Override
    @Transactional
    public void deleteUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        preserveRoleRequestsThenDeleteUser(user);
    }

    private void preserveRoleRequestsThenDeleteUser(User user) {
        List<RoleRequest> userRoleRequests = roleRequestRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (RoleRequest roleRequest : userRoleRequests) {
            roleRequest.setRequesterName(user.getFullName());
            roleRequest.setRequesterEmail(user.getEmail());
            roleRequest.setUserDeleted(true);
            roleRequest.setUser(null);
        }
        roleRequestRepository.saveAll(userRoleRequests);

        notificationRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
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
        roleRequest.setRequesterName(user.getFullName());
        roleRequest.setRequesterEmail(user.getEmail());
        roleRequest.setUserDeleted(false);
        roleRequest.setCurrentRole(user.getRole());
        roleRequest.setRequestedRole(request.getRequestedRole());
        roleRequest.setReason(request.getReason());
        roleRequest.setStatus(RoleRequest.Status.PENDING);
        roleRequest.setCreatedAt(LocalDateTime.now());

        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);
        String submittedAt = NotificationMessageUtils.formatEventTimestamp(savedRequest.getCreatedAt());
        String requestedTransition = NotificationMessageUtils.formatRole(savedRequest.getCurrentRole())
                + " to " + NotificationMessageUtils.formatRole(savedRequest.getRequestedRole());

        List<User> admins = userRepository.findByRoleIn(List.of(Role.TECHNICIAN, Role.SYSTEM_ADMIN));

        for (User admin : admins) {
          Notification adminNotification = new Notification();
          adminNotification.setTitle("Role Change Request");
          adminNotification.setMessage(
                  user.getFullName() + " requested a role change from " + requestedTransition
                          + " on " + submittedAt + "."
          );
          adminNotification.setRead(false);
          adminNotification.setCreatedAt(savedRequest.getCreatedAt());
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
        userNotification.setMessage(
                "You requested a role change from " + requestedTransition + " on " + submittedAt + "."
        );
        userNotification.setRead(false);
        userNotification.setCreatedAt(savedRequest.getCreatedAt());
        userNotification.setUser(user);
        notificationRepository.save(userNotification);

        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "Role Request Submitted",
                    "Hello " + user.getFullName() + ", your role change request has been submitted successfully."
            );
        } catch (Exception e) {
            System.out.println("Submit email failed: " + e.getMessage());
        }

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

        if (roleRequest.isUserDeleted() || roleRequest.getUser() == null) {
            throw new RuntimeException("User account deleted. This request cannot be reviewed.");
        }

        User user = roleRequest.getUser();
        user.setRole(roleRequest.getRequestedRole());
        userRepository.save(user);

        roleRequest.setStatus(RoleRequest.Status.APPROVED);
        roleRequest.setReviewedAt(LocalDateTime.now());
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);
        String submittedAt = NotificationMessageUtils.formatEventTimestamp(savedRequest.getCreatedAt());
        String reviewedAt = NotificationMessageUtils.formatEventTimestamp(savedRequest.getReviewedAt());
        String requestedTransition = NotificationMessageUtils.formatRole(savedRequest.getCurrentRole())
                + " to " + NotificationMessageUtils.formatRole(savedRequest.getRequestedRole());

        Notification userNotification = new Notification();
        userNotification.setTitle("Role Request Approved");
        userNotification.setMessage(
                "Your role change request from " + requestedTransition + ", submitted on " + submittedAt
                        + ", was approved by admin on " + reviewedAt + "."
        );
        userNotification.setRead(false);
        userNotification.setCreatedAt(savedRequest.getReviewedAt());
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

        if (roleRequest.isUserDeleted() || roleRequest.getUser() == null) {
            throw new RuntimeException("User account deleted. This request cannot be reviewed.");
        }

        roleRequest.setStatus(RoleRequest.Status.REJECTED);
        roleRequest.setReviewedAt(LocalDateTime.now());
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);

        User user = roleRequest.getUser();
        String submittedAt = NotificationMessageUtils.formatEventTimestamp(savedRequest.getCreatedAt());
        String reviewedAt = NotificationMessageUtils.formatEventTimestamp(savedRequest.getReviewedAt());
        String requestedTransition = NotificationMessageUtils.formatRole(savedRequest.getCurrentRole())
                + " to " + NotificationMessageUtils.formatRole(savedRequest.getRequestedRole());

        Notification userNotification = new Notification();
        userNotification.setTitle("Role Request Rejected");
        userNotification.setMessage(
                "Your role change request from " + requestedTransition + ", submitted on " + submittedAt
                        + ", was rejected by admin on " + reviewedAt + "."
        );
        userNotification.setRead(false);
        userNotification.setCreatedAt(savedRequest.getReviewedAt());
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
