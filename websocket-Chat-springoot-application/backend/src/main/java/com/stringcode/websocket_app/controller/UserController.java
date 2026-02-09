package com.stringcode.websocket_app.controller;

import com.stringcode.websocket_app.dto.UserUpdateDto;
import com.stringcode.websocket_app.model.User;
import com.stringcode.websocket_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UserUpdateDto updateDto
    ) {
        User user = userRepository.findById(currentUser.getId()).orElseThrow();
        if (updateDto.getFullName() != null) {
            user.setFullName(updateDto.getFullName());
        }
        if (updateDto.getPhoneNumber() != null) {
            user.setPhoneNumber(updateDto.getPhoneNumber());
        }
        return ResponseEntity.ok(userRepository.save(user));
    }
}
