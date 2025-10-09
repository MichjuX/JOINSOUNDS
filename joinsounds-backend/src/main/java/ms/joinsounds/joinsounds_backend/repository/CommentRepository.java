package ms.joinsounds.joinsounds_backend.repository;

import jakarta.transaction.Transactional;
import ms.joinsounds.joinsounds_backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPostId(UUID id);
    List<Comment> findByPostIdOrderByCreatedAtDesc(UUID postId);

    // Statystyki dla konkretnego użytkownika
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId")
    long countTotalCommentsByUser(@Param("userId") UUID userId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId AND c.createdAt >= :startDate")
    long countCommentsSinceByUser(@Param("userId") UUID userId, @Param("startDate") LocalDateTime startDate);

    @Modifying
    @Transactional
    @Query("delete from Comment c where c.post.id = :postId")
    void deleteByPostId(@Param("postId") UUID postId);
}
