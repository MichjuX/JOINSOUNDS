package ms.joinsounds.joinsounds_backend.repository;

import ms.joinsounds.joinsounds_backend.entity.Tag;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID>{

    UserProfile findByUser(User user);
}
