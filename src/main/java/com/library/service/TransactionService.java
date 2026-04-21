package com.library.service;

import com.library.dto.request.IssueRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {
    TransactionResponse issueBook(IssueRequest request);
    TransactionResponse returnBook(ReturnRequest request);
    List<TransactionResponse> getTransactionsByUser(Long userId);
    List<TransactionResponse> getAllTransactions();
}
