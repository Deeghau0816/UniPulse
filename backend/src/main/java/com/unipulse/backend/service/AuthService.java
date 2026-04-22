package com.unipulse.backend.service;

import com.unipulse.backend.dto.AuthResponse;
import com.unipulse.backend.dto.CompleteProfileRequest;
import com.unipulse.backend.dto.LoginRequest;
import com.unipulse.backend.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse completeProfile(String email, CompleteProfileRequest request);
}