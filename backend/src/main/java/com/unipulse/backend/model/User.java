package com.unipulse.backend.model;

import com.unipulse.backend.util.NameUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName = "";

    @Column(name = "sliit_id", unique = true)
    private String sliitId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "profile_image", columnDefinition = "LONGTEXT")
    private String profileImage;

    @Column(name = "profile_completed", nullable = false)
    private boolean profileCompleted = false;

    @Transient
    public String getFullName() {
        return NameUtils.buildFullName(firstName, lastName);
    }

    public void setFullName(String fullName) {
        String[] names = NameUtils.splitFullName(fullName);
        this.firstName = names[0];
        this.lastName = names[1];
    }

    @Transient
    public String getName() {
        return getFullName();
    }
}