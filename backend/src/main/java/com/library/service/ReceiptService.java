package com.library.service;

import com.library.dto.response.TransactionResponse;

public interface ReceiptService {

    /**
     * Renders a printable PDF circulation receipt for a single transaction.
     *
     * @return the PDF document as a byte array
     */
    byte[] generateTransactionReceipt(TransactionResponse transaction);
}
