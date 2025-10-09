package ms.joinsounds.joinsounds_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class JoinsoundsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(JoinsoundsBackendApplication.class, args);
	}

}
