package com.unipulse.backend.Repository;

import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findBySliitId(String sliitId);

    List<User> findByRole(Role role);
}
