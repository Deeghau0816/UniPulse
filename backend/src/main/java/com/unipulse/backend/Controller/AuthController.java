package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.AuthResponse;
import com.unipulse.backend.dto.CompleteProfileRequest;
import com.unipulse.backend.dto.LoginRequest;
import com.unipulse.backend.dto.RegisterRequest;
import com.unipulse.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/complete-profile")
    public ResponseEntity<AuthResponse> completeProfile(@Valid @RequestBody CompleteProfileRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(authService.completeProfile(authentication.getName(), request));
    }
}
