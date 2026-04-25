package com.unipulse.backend.service;

import com.unipulse.backend.dto.AuthResponse;
import com.unipulse.backend.dto.CompleteProfileRequest;
import com.unipulse.backend.dto.LoginRequest;
import com.unipulse.backend.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request, String userAgent);
    AuthResponse adminRegister(RegisterRequest request, String userAgent);
    AuthResponse login(LoginRequest request, String userAgent);
    AuthResponse adminLogin(LoginRequest request, String userAgent);
    AuthResponse completeProfile(String email, CompleteProfileRequest request);
}
