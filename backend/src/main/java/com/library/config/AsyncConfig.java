package com.library.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables @Async on service methods (used by EmailServiceImpl
 * so email sending doesn't block the main HTTP request thread).
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
