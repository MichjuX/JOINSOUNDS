package ms.joinsounds.joinsounds_backend.repository;

import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.PostLike;
import ms.joinsounds.joinsounds_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {
    Optional<PostLike> findByPostAndUser(Post post, User user);
    boolean existsByPostAndUser(Post post, User user);
    long countByPost(Post post);
    void deleteByPostAndUser(Post post, User user);

    List<PostLike> findAllByPost(Post post);

    @Query("SELECT t.name, COUNT(l) " +
            "FROM PostLike l " +
            "JOIN l.post p " +
            "JOIN p.tags t " +
            "WHERE l.user.id = :userId " +
            "GROUP BY t.name " +
            "ORDER BY COUNT(l) DESC")
    List<Object[]> countLikesByTagForUser(@Param("userId") UUID userId);

    // Statystyki dla konkretnego użytkownika
    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.user.id = :userId")
    long countTotalLikesByUser(@Param("userId") UUID userId);

    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.user.id = :userId AND pl.createdAt >= :startDate")
    long countLikesSinceByUser(@Param("userId") UUID userId, @Param("startDate") LocalDateTime startDate);
}
