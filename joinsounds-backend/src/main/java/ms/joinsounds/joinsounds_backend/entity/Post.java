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

    private Boolean isFinished = false;

    private String audioFilePath;

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
    @JsonIgnore
    private Set<Tag> tags = new HashSet<>();

    // Nowa relacja dla like'ów
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Set<PostLike> likes = new HashSet<>();

    // Metoda pomocnicza do pobierania liczby like'ów
    @Transient
    public int getLikeCount() {
        return likes.size();
    }

    // Metoda pomocnicza do sprawdzania czy użytkownik polubił post
    @Transient
    public boolean isLikedByUser(User user) {
        if (user == null) return false;
        return likes.stream().anyMatch(like -> like.getUser().equals(user));
    }

    public void setTags(Set<Tag> tags) {
        this.tags.clear();
        if (tags != null) {
            this.tags.addAll(tags);
            tags.forEach(tag -> tag.getPosts().add(this));
        }
    }
}