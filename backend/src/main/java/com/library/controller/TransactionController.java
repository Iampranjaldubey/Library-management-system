package com.library.controller;

import com.library.dto.request.IssueRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.TransactionResponse;
import com.library.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Book issue and return operations")
@SecurityRequirement(name = "BearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Issue a book to a user",
               description = """
                       Issues an available book to a user.
                       - Due date is automatically set to **7 days** from today.
                       - Returns 400 if the book is already issued.
                       Requires ADMIN or LIBRARIAN role.
                       """)
    public ResponseEntity<ApiResponse<TransactionResponse>> issueBook(
            @Valid @RequestBody IssueRequest request) {

        TransactionResponse response = transactionService.issueBook(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book issued successfully", response));
    }

    @PostMapping("/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Return a book",
               description = """
                       Records the return of a book.
                       - Fine = **₹5 per overdue day** (applied automatically if returned after due date).
                       - Fine is `null` if returned on time.
                       Requires ADMIN or LIBRARIAN role.
                       """)
    public ResponseEntity<ApiResponse<TransactionResponse>> returnBook(
            @Valid @RequestBody ReturnRequest request) {

        TransactionResponse response = transactionService.returnBook(request);
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", response));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get all transactions",
               description = "Returns all issue/return records. Requires ADMIN or LIBRARIAN role.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions() {
        return ResponseEntity.ok(
                ApiResponse.success("Transactions fetched successfully",
                        transactionService.getAllTransactions()));
    }

    @GetMapping("/transactions/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get transactions by user ID",
               description = "Returns all transactions for a specific user.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactionsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                ApiResponse.success("User transactions fetched successfully",
                        transactionService.getTransactionsByUser(userId)));
    }
}
