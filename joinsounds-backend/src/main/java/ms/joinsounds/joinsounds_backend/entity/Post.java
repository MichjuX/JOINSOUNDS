package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class Post {
    @Id
    @UuidGenerator
    private UUID id;
    private String title;
    @Column(columnDefinition = "LONGTEXT")
    private String content;
    private String audioFilePath;
    private String waveformFilePath;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
}
