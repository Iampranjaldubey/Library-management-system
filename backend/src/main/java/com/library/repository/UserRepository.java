package com.library.repository;

import com.library.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByMemberId(String memberId);

    @Query("""
            SELECT u FROM User u
            WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(u.memberId) LIKE LOWER(CONCAT('%', :q, '%'))
            """)
    Page<User> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT MAX(u.id) FROM User u")
    Long findMaxId();
}

