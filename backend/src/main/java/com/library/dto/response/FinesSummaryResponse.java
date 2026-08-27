package com.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FinesSummaryResponse {
    private double totalOutstanding;
    private double totalCollected;
    private long   outstandingCount;
    private long   collectedCount;
}
