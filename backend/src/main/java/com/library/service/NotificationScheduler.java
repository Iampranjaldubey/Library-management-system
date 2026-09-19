package com.library.service;

import com.library.entity.Transaction;
import com.library.entity.User;
import com.library.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final TransactionRepository transactionRepository;

    // Run every day at 8:00 AM server time
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional(readOnly = true)
    public void sendDueSoonNotifications() {
        log.info("Starting scheduled task: Due Soon Notifications");
        
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Transaction> dueTomorrow = transactionRepository.findByDueDateAndReturnDateIsNullWithDetails(tomorrow);
        
        for (Transaction t : dueTomorrow) {
            User user = t.getUser();
            log.info("Sending 'Due Soon' notification to {} for book '{}'", user.getEmail(), t.getBook().getTitle());
            // In a real system, you would integrate with an Email or SMS Service here.
        }
        
        log.info("Finished Due Soon Notifications. Sent {} notices.", dueTomorrow.size());
    }

    // Run every day at 9:00 AM server time
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional(readOnly = true)
    public void sendOverdueNotifications() {
        log.info("Starting scheduled task: Overdue Notifications");
        
        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Transaction> overdue = transactionRepository.findByDueDateAndReturnDateIsNullWithDetails(yesterday);
        
        for (Transaction t : overdue) {
            User user = t.getUser();
            log.info("Sending 'Overdue' notification to {} for book '{}'", user.getEmail(), t.getBook().getTitle());
            // In a real system, you would integrate with an Email or SMS Service here.
        }
        
        log.info("Finished Overdue Notifications. Sent {} notices.", overdue.size());
    }
}
