package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

@Entity
@Data
public class UserProfile {
    @Id
    @UuidGenerator
    private UUID id;

    private String profilePicturePath;
    private String bio;

    @ElementCollection
    @CollectionTable(name = "user_profile_tools", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "tool")
    private List<String> tools;

    @ElementCollection
    @CollectionTable(name = "user_profile_genres", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "genre")
    private List<String> genres;

    @OneToOne
    private User user;
}
