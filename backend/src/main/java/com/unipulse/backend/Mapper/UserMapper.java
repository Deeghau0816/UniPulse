package com.unipulse.backend.Mapper;

import com.unipulse.backend.dto.UserResponseDto;
import com.unipulse.backend.model.User;

public class UserMapper {

    public static UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
