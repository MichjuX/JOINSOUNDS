package ms.joinsounds.joinsounds_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.NaturalId;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "tags")
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NaturalId
    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    private Set<Post> posts = new HashSet<>();

    public Tag() {}

    public Tag(String name) {
        this.name = name.toLowerCase(); // Normalizacja do małych liter
    }

    public void setName(String name) {
        this.name = name.toLowerCase();
    }
}