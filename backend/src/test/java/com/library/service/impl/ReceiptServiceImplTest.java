package com.library.service.impl;

import com.library.dto.response.TransactionResponse;
import com.library.service.ReceiptService;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the OpenPDF receipt generator. No Spring context — just verifies
 * that valid, non-empty PDF documents are produced for the relevant transaction
 * shapes (returned-with-fine and active-no-fine), checking the %PDF magic header.
 */
class ReceiptServiceImplTest {

    private final ReceiptService receiptService = new ReceiptServiceImpl();

    private static String magic(byte[] pdf) {
        return new String(pdf, 0, Math.min(5, pdf.length), StandardCharsets.US_ASCII);
    }

    @Test
    void generatesValidPdfForReturnedTransactionWithFine() {
        TransactionResponse tx = TransactionResponse.builder()
                .id(42L)
                .userId(1L).userName("Ada Lovelace")
                .bookId(2L).bookTitle("Domain-Driven Design")
                .issueDate(LocalDate.now().minusDays(12))
                .dueDate(LocalDate.now().minusDays(5))
                .returnDate(LocalDate.now())
                .fine(25.0)
                .finePaid(false)
                .status("RETURNED")
                .build();

        byte[] pdf = receiptService.generateTransactionReceipt(tx);

        assertThat(pdf).isNotEmpty();
        assertThat(pdf.length).isGreaterThan(400);
        assertThat(magic(pdf)).isEqualTo("%PDF-");
    }

    @Test
    void generatesValidPdfForActiveTransactionWithoutFine() {
        TransactionResponse tx = TransactionResponse.builder()
                .id(7L)
                .userId(3L).userName("Bob")
                .bookId(9L).bookTitle("Clean Code")
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(7))
                .returnDate(null)
                .fine(null)
                .finePaid(false)
                .status("ACTIVE")
                .build();

        byte[] pdf = receiptService.generateTransactionReceipt(tx);

        assertThat(pdf).isNotEmpty();
        assertThat(magic(pdf)).isEqualTo("%PDF-");
    }
}
