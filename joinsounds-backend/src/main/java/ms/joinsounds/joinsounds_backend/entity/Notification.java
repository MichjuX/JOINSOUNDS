package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @UuidGenerator
    private UUID id;

    private UUID userId;

    private String type;

    private String message;

    private UUID relatedEntityId;

    private String relatedEntityType;

    private boolean isRead;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
