package ms.joinsounds.joinsounds_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AnalyticsDto {
    private long userTotalLikes;
    private long userTotalComments;
    private long userLastWeekLikes;
    private long userLastWeekComments;
}
