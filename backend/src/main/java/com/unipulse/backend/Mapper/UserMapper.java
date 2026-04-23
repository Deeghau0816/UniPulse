package com.unipulse.backend.Mapper;

import com.unipulse.backend.dto.UserResponseDto;
import com.unipulse.backend.model.User;

public class UserMapper {

    private UserMapper() {
    }

    public static UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .name(user.getFullName())
                .sliitId(user.getSliitId())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .provider(user.getProvider())
                .profileCompleted(user.isProfileCompleted())
                .build();
    }
}