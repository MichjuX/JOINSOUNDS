package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Data
@Entity
public class Comment {
    @Id
    @UuidGenerator
    private UUID id;

    private String content;

    // Czas rozpoczęcia regionu w sekundach
    private Double startTime;

    // Czas zakończenia regionu w sekundach
    private Double endTime;

    // Kolor regionu w formacie HEX lub RGBA (opcjonalny)
    private String color;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}