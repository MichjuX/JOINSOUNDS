package ms.joinsounds.joinsounds_backend.repository;

import ms.joinsounds.joinsounds_backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);

    List<Tag> findByNameContainingIgnoreCase(String name);

    @Query("SELECT t FROM Tag t ORDER BY SIZE(t.posts) DESC")
    List<Tag> findPopularTags();

    @Query("SELECT t FROM Tag t JOIN t.posts p WHERE p.id = :postId")
    List<Tag> findByPostId(@Param("postId") UUID postId);
}