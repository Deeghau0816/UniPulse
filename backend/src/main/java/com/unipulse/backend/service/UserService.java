package com.unipulse.backend.service;

import com.unipulse.backend.dto.RoleRequestCreateRequest;
import com.unipulse.backend.dto.RoleRequestResponse;
import com.unipulse.backend.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    Optional<User> getUserByEmail(String email);

    RoleRequestResponse createRoleRequest(Long userId, RoleRequestCreateRequest request);
    List<RoleRequestResponse> getMyRoleRequests(Long userId);
    List<RoleRequestResponse> getAllRoleRequests();
    RoleRequestResponse approveRoleRequest(Long requestId);
    RoleRequestResponse rejectRoleRequest(Long requestId);
}
