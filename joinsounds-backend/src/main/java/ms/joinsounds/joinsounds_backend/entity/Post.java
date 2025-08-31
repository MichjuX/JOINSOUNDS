package ms.joinsounds.joinsounds_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "post")
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @EqualsAndHashCode.Exclude
    @JsonIgnore // Zapobiega serializacji cyklicznej
    private Set<Tag> tags = new HashSet<>();

    // W encji Post
    public void setTags(Set<Tag> tags) {
        this.tags.clear();
        if (tags != null) {
            this.tags.addAll(tags);
            tags.forEach(tag -> tag.getPosts().add(this));
        }
    }
}