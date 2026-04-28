package com.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionResponse {
    private Long      id;
    private Long      userId;
    private String    userName;
    private Long      bookId;
    private String    bookTitle;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Double    fine;
    private String    status;   // "ACTIVE" | "RETURNED" | "OVERDUE"
}
