package ms.joinsounds.joinsounds_backend.repository;

import ms.joinsounds.joinsounds_backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

}
