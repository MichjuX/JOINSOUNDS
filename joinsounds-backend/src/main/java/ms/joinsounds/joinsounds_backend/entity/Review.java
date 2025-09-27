package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Review {
    @Id
    @UuidGenerator
    private UUID id;
    private Integer rating;
    private String content;

    @ManyToOne
    private User userAbout;

    @ManyToOne
    private User userFrom;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
