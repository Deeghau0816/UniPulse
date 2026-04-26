package com.unipulse.backend.Controller;

import com.unipulse.backend.Mapper.UserMapper;
import com.unipulse.backend.dto.RoleRequestCreateRequest;
import com.unipulse.backend.dto.RoleRequestResponse;
import com.unipulse.backend.dto.UpdateUserRequest;
import com.unipulse.backend.dto.UserResponseDto;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import com.unipulse.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers()
                .stream()
                .map(UserMapper::toDto)
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserResponseDto>> getTechnicians() {
        List<UserResponseDto> technicians = userService.getAllUsers()
                .stream()
                .filter(user -> user.getRole() == Role.TECHNICIAN)
                .map(UserMapper::toDto)
                .toList();

        return ResponseEntity.ok(technicians);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyProfile(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateMyProfile(
            Principal principal,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        User updated = userService.updateMyProfile(principal.getName(), request);
        return ResponseEntity.ok(UserMapper.toDto(updated));
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyProfile(Principal principal) {
        userService.deleteMyProfile(principal.getName());
        return ResponseEntity.ok("Account deleted successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PostMapping("/{userId}/role-requests")
    public ResponseEntity<RoleRequestResponse> createRoleRequest(
            @PathVariable Long userId,
            @Valid @RequestBody RoleRequestCreateRequest request,
            Principal principal
    ) {
        User currentUser = userService.getCurrentUser(principal.getName());
        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You can only create requests for your own account");
        }

        return ResponseEntity.ok(userService.createRoleRequest(userId, request));
    }

    @GetMapping("/{userId}/role-requests")
    public ResponseEntity<List<RoleRequestResponse>> getMyRoleRequests(
            @PathVariable Long userId,
            Principal principal
    ) {
        User currentUser = userService.getCurrentUser(principal.getName());

        boolean isAdminSide = currentUser.getRole() == Role.TECHNICIAN || currentUser.getRole() == Role.SYSTEM_ADMIN;
        if (!currentUser.getId().equals(userId) && !isAdminSide) {
            throw new RuntimeException("You can only view your own requests");
        }

        return ResponseEntity.ok(userService.getMyRoleRequests(userId));
    }

    @GetMapping("/admin/role-requests")
    public ResponseEntity<List<RoleRequestResponse>> getAllRoleRequests() {
        return ResponseEntity.ok(userService.getAllRoleRequests());
    }

    @PutMapping("/admin/role-requests/{requestId}/approve")
    public ResponseEntity<RoleRequestResponse> approveRoleRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(userService.approveRoleRequest(requestId));
    }

    @PutMapping("/admin/role-requests/{requestId}/reject")
    public ResponseEntity<RoleRequestResponse> rejectRoleRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(userService.rejectRoleRequest(requestId));
    }
}