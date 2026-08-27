package com.library.service;

import com.library.entity.User;

public interface EmailService {
    void sendVerificationEmail(User user, String token);
    void sendPasswordResetEmail(User user, String token);
}
