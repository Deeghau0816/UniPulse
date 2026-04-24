package com.unipulse.backend.Controller;

import com.unipulse.backend.dto.AuthResponse;
import com.unipulse.backend.dto.CompleteProfileRequest;
import com.unipulse.backend.dto.LoginRequest;
import com.unipulse.backend.dto.RegisterRequest;
import com.unipulse.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.register(request, httpRequest.getHeader("User-Agent")));
    }

    @PostMapping("/admin/register")
    public ResponseEntity<AuthResponse> adminRegister(@Valid @RequestBody RegisterRequest request,
                                                      HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.adminRegister(request, httpRequest.getHeader("User-Agent")));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, httpRequest.getHeader("User-Agent")));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody LoginRequest request,
                                                   HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.adminLogin(request, httpRequest.getHeader("User-Agent")));
    }

    @PutMapping("/complete-profile")
    public ResponseEntity<AuthResponse> completeProfile(@Valid @RequestBody CompleteProfileRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(authService.completeProfile(authentication.getName(), request));
    }

    @GetMapping("/google/login/start")
    public void startUserGoogleLogin(HttpServletResponse response, HttpSession session) throws IOException {
        session.setAttribute("oauth_mode", "user-login");
        response.sendRedirect("http://localhost:8081/oauth2/authorization/google");
    }

    @GetMapping("/google/register/start")
    public void startUserGoogleRegister(HttpServletResponse response, HttpSession session) throws IOException {
        session.setAttribute("oauth_mode", "user-register");
        response.sendRedirect("http://localhost:8081/oauth2/authorization/google");
    }

    @GetMapping("/admin/google/login/start")
    public void startAdminGoogleLogin(HttpServletResponse response, HttpSession session) throws IOException {
        session.setAttribute("oauth_mode", "admin-login");
        response.sendRedirect("http://localhost:8081/oauth2/authorization/google");
    }

    @GetMapping("/admin/google/register/start")
    public void startAdminGoogleRegister(HttpServletResponse response, HttpSession session) throws IOException {
        session.setAttribute("oauth_mode", "admin-register");
        response.sendRedirect("http://localhost:8081/oauth2/authorization/google");
    }

    @GetMapping("/admin/google/start")
    public void startAdminGoogleLegacy(HttpServletResponse response, HttpSession session) throws IOException {
        session.setAttribute("oauth_mode", "admin-login");
        response.sendRedirect("http://localhost:8081/oauth2/authorization/google");
    }
}
