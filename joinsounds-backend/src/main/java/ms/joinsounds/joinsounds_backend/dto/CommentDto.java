package ms.joinsounds.joinsounds_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import ms.joinsounds.joinsounds_backend.entity.Post;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CommentDto {
    private UUID id;
    private String content;
    private Double startTime;
    private Double endTime;
    private String color;
    private LocalDateTime createdAt;
    private UserDto user;
    private String userProfilePicturePath;
}
