package com.library.service;

public interface PasswordResetService {
    /** Generate a reset token and send an email. Always returns success to prevent email enumeration. */
    void requestReset(String email);

    /** Validate token and set a new password. */
    void resetPassword(String token, String newPassword);
}
