package com.unipulse.backend.dto;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String provider;

    public UserResponse() {
    }

    public UserResponse(Long id, String fullName, String email, String role, String provider) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.provider = provider;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}