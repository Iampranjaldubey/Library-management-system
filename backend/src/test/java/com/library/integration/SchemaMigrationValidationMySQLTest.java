package com.library.integration;

import com.library.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves the real schema and the JPA entities agree.
 *
 * <p>Boots the full application against a throwaway MySQL container with Flyway
 * ENABLED and Hibernate {@code ddl-auto=validate}. If Flyway V1..V5 produce a
 * schema that doesn't match every {@code @Entity} (a missing column, a type
 * mismatch such as the {@code books.version} added in V5, etc.), Hibernate's
 * validation fails and the context refuses to start — failing this test.
 *
 * <p>This is the check the H2 test profile cannot give us: H2 runs with
 * {@code create-drop} and Flyway disabled, so it never exercises the migrations.
 *
 * <p>{@code disabledWithoutDocker = true} makes the class skip (not fail) where
 * no Docker daemon is available; it runs in CI and on any machine with Docker.
 */
@SpringBootTest
@ActiveProfiles("mysqltest")
@Testcontainers(disabledWithoutDocker = true)
class SchemaMigrationValidationMySQLTest {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
    }

    @Autowired
    private BookRepository bookRepository;

    @Test
    void migrationsApplyAndSchemaValidatesAgainstEntities() {
        // Reaching this point means Flyway migrated a fresh MySQL database and
        // Hibernate validated the schema against the entities during startup.
        // A trivial query confirms the persistence layer is actually usable.
        assertThat(bookRepository.count()).isGreaterThanOrEqualTo(0);
    }
}
