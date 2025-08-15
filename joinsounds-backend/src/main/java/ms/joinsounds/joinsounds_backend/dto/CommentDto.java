package ms.joinsounds.joinsounds_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CommentDto {
    private String content;
    private Double startTime;
    private Double endTime;
    private String color;
    private String postId;
}
