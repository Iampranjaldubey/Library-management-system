package com.library.controller;

import com.library.dto.request.IssueRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.FinesSummaryResponse;
import com.library.dto.response.TransactionResponse;
import com.library.service.ReceiptService;
import com.library.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Book issue and return operations")
@SecurityRequirement(name = "BearerAuth")
public class TransactionController {

    private final TransactionService transactionService;
    private final ReceiptService     receiptService;

    @PostMapping("/api/v1/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Transactional
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

    @PostMapping("/api/v1/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Transactional
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

    @PutMapping("/api/v1/transactions/{id}/collect-fine")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Collect fine for a transaction",
               description = "Marks the fine as paid for a returned overdue book.")
    public ResponseEntity<ApiResponse<TransactionResponse>> collectFine(
            @PathVariable Long id) {

        TransactionResponse response = transactionService.collectFine(id);
        return ResponseEntity.ok(ApiResponse.success("Fine collected successfully", response));
    }

    @GetMapping("/api/v1/transactions/outstanding-fines")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Get outstanding fines summary",
               description = "Returns total outstanding and collected fines.")
    public ResponseEntity<ApiResponse<FinesSummaryResponse>> getOutstandingFines() {
        return ResponseEntity.ok(
                ApiResponse.success("Fines summary fetched", transactionService.getOutstandingFines()));
    }

    @GetMapping("/api/v1/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Transactional(readOnly = true)
    @Operation(summary = "Get all transactions",
               description = "Returns all issue/return records. Requires ADMIN or LIBRARIAN role.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions() {
        return ResponseEntity.ok(
                ApiResponse.success("Transactions fetched successfully",
                        transactionService.getAllTransactions()));
    }

    @GetMapping("/api/v1/transactions/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Transactional(readOnly = true)
    @Operation(summary = "Get transactions by user ID",
               description = "Returns all transactions for a specific user.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactionsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                ApiResponse.success("User transactions fetched successfully",
                        transactionService.getTransactionsByUser(userId)));
    }

    @GetMapping("/api/v1/transactions/{id}/receipt")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Transactional(readOnly = true)
    @Operation(summary = "Download a transaction receipt (PDF)",
               description = "Generates a printable PDF receipt for a single transaction. "
                       + "Requires ADMIN or LIBRARIAN role.")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {
        TransactionResponse transaction = transactionService.getTransaction(id);
        byte[] pdf = receiptService.generateTransactionReceipt(transaction);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"receipt-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

