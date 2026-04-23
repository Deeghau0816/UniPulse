package com.unipulse.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private String requesterName;

    @Column(nullable = false)
    private String requesterEmail;

    @Column(nullable = false)
    private boolean userDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role currentRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role requestedRole;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
}