package com.library.service;

import com.library.entity.User;

public interface EmailVerificationService {
    /** Generate a verification token and send email. */
    void sendVerification(User user);

    /** Validate the token and mark the user as verified. */
    void verifyEmail(String token);

    /** Resend a verification email for the given email address. */
    void resendVerification(String email);
}
