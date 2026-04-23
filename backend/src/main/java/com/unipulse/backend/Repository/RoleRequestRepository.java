package com.unipulse.backend.Repository;

import com.unipulse.backend.model.RoleRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {

    List<RoleRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<RoleRequest> findByStatusOrderByCreatedAtDesc(RoleRequest.Status status);

    List<RoleRequest> findAllByOrderByCreatedAtDesc();
}