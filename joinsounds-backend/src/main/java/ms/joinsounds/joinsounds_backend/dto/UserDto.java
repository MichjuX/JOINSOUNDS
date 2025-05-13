package ms.joinsounds.joinsounds_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import ms.joinsounds.joinsounds_backend.entity.User;

import java.util.UUID;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {
    private UUID id;
    private String email;
    private String name;
    private String city;
    private String role;
    private boolean verified;
}
