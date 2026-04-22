package com.unipulse.backend.Repository;

import com.unipulse.backend.model.RoleRequest;
import com.unipulse.backend.model.RoleRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {

    List<RoleRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<RoleRequest> findByStatusOrderByCreatedAtDesc(RoleRequestStatus status);

    List<RoleRequest> findAllByOrderByCreatedAtDesc();
}
