package com.unipulse.backend.Controller;

import com.unipulse.backend.Mapper.UserMapper;
import com.unipulse.backend.dto.RoleRequestCreateRequest;
import com.unipulse.backend.dto.RoleRequestResponse;
import com.unipulse.backend.dto.UserResponseDto;
import com.unipulse.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}/role-requests")
    public ResponseEntity<RoleRequestResponse> createRoleRequest(
            @PathVariable Long userId,
            @Valid @RequestBody RoleRequestCreateRequest request
    ) {
        return ResponseEntity.ok(userService.createRoleRequest(userId, request));
    }

    @GetMapping("/{userId}/role-requests")
    public ResponseEntity<List<RoleRequestResponse>> getMyRoleRequests(@PathVariable Long userId) {
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
