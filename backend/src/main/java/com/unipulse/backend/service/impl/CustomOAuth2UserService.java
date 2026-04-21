package com.unipulse.backend.service.impl;

import com.unipulse.backend.Repository.UserRepository;
import com.unipulse.backend.model.AuthProvider;
import com.unipulse.backend.model.Role;
import com.unipulse.backend.model.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = (String) attributes.get("email");
        String fullName = (String) attributes.get("name");

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(fullName != null && !fullName.isBlank() ? fullName : "OAuth User");
            user.setPassword(UUID.randomUUID().toString());
            user.setRole(Role.STUDENT);
            user.setProvider(AuthProvider.GOOGLE);
            user = userRepository.save(user);
        } else {
            if (user.getProvider() == null) {
                user.setProvider(AuthProvider.GOOGLE);
            }
            if (user.getFullName() == null || user.getFullName().isBlank()) {
                user.setFullName(fullName != null && !fullName.isBlank() ? fullName : user.getEmail());
            }
            user = userRepository.save(user);
        }

        String authority = "ROLE_" + user.getRole().name();

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(authority)),
                attributes,
                "email"
        );
    }
}