package ms.joinsounds.joinsounds_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import ms.joinsounds.joinsounds_backend.entity.PostLike;
import ms.joinsounds.joinsounds_backend.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostDto {
    private UUID id;
    private String title;
    private String content;
    private String audioFilePath;
    private String waveformFilePath;
    private Boolean isFinished;
    private LocalDateTime createdAt;
    private UserDto user;
    private List<String> tags;
    private String userProfilePicturePath;
    private Boolean isLikedByCurrentUser;
    private Integer likeCount;
}

