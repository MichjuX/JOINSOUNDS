package ms.joinsounds.joinsounds_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReviewDto {
    private UUID id;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private UUID userAboutId;
    private String userFromUsername;
    private UUID userFromId;
    private String userFromProfilePicturePath;
}
