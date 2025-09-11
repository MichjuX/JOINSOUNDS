package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Notification;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.NotificationRepository;
import ms.joinsounds.joinsounds_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService _notificationService;
    private final NotificationRepository _notificationRepository;

    @GetMapping("/authenticated/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        UUID userId = user.getId();

        return ResponseEntity.ok(_notificationService.getUserNotifications(userId));
    }

    @GetMapping("/authenticated/notifications/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        UUID userId = user.getId();

        return ResponseEntity.ok(_notificationRepository.countByUserIdAndIsReadFalse(userId));
    }

    @PostMapping("/authenticated/notifications/mark-as-read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        _notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/authenticated/notifications/mark-all-as-read")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        UUID userId = user.getId();

        _notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
