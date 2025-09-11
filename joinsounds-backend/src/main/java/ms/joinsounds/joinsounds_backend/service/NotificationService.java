package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Notification;
import ms.joinsounds.joinsounds_backend.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository _notificationRepository;
    private final SimpMessagingTemplate _messagingTemplate;

    public void createNotification(UUID userId,
                                   String type,
                                   String message,
                                   UUID relatedEntityId,
                                   String relatedEntityType) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        _notificationRepository.save(notification);

        // Wysyłanie powiadomienia przez WebSocket
        // ZMIANA: Używaj topic zamiast user destination
        _messagingTemplate.convertAndSend("/topic/notifications." + userId.toString(), notification);
    }

    public List<Notification> getUserNotifications(UUID userId) {
        return _notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(UUID notificationId) {
        _notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            _notificationRepository.save(notification);
        });
    }
    public void markAllAsRead(UUID userId) {
        List<Notification> notifications = _notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                _notificationRepository.save(notification);
            }
        }
    }
}
