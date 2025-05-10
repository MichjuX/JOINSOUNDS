package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

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
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
