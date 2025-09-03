package ms.joinsounds.joinsounds_backend.repository;

import ms.joinsounds.joinsounds_backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t.name = :tagName")
    Page<Post> findByTagName(@Param("tagName") String tagName, Pageable pageable);

    // Alternatywna wersja z ignorowaniem wielkości liter
    @Query("SELECT p FROM Post p JOIN p.tags t WHERE LOWER(t.name) = LOWER(:tagName)")
    List<Post> findByTagNameIgnoreCase(@Param("tagName") String tagName);

    // Wersja z wieloma tagami
    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t.name IN :tagNames")
    List<Post> findByTagNames(@Param("tagNames") List<String> tagNames);
}