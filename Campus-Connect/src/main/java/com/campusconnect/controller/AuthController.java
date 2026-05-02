package com.campusconnect.controller;

import com.campusconnect.dto.LoginRequest;
import com.campusconnect.dto.LoginResponse;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> userOpt = repo.findByEmail(request.getEmail());

        // ❌ User not found
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401)
                    .body("User not found");
        }

        User user = userOpt.get();

        // ❌ Wrong password (handles both BCrypt and plain-text for migration, though BCrypt is preferred)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Fallback for existing plain-text passwords (optional, but good for transition)
            if (!user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.status(401)
                        .body("Invalid credentials");
            }
        }

        // ❌ Not approved
        if (!user.isApproved()) {
            return ResponseEntity.status(403)
                    .body("Account not approved");
        }

        // ✅ Generate JWT with role
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        // ✅ Send response
        return ResponseEntity.ok(
                new LoginResponse(
                        user.getId(),
                        token,
                        user.getEmail(),
                        user.getRole(),
                        user.getName(),
                        user.getDepartment(),
                        user.getYear(),
                        user.isFinanceAccess()
                )
        );
    }
}