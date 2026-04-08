package com.unipulse.backend.service;

import com.unipulse.backend.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User saveUser(User user);
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
}