package ms.joinsounds.joinsounds_backend.dto;

import lombok.Data;
import ms.joinsounds.joinsounds_backend.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PostLikeDto {
    UUID userId;
    String userNickname;
    LocalDateTime likedAt;
}
