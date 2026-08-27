package com.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Generic paginated response wrapper.
 * Used by all list endpoints that support server-side pagination.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PagedResponse<T> {
    private List<T>  content;
    private int      page;
    private int      size;
    private long     totalElements;
    private int      totalPages;
    private boolean  first;
    private boolean  last;
}
