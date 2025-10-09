package ms.joinsounds.joinsounds_backend.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class DailyPostService {
    private final PostRepository postRepository;

    @Getter
    private Post currentPostOfTheDay;

    // 🔸 Uruchamia się co 24 godziny (o północy)
    @Scheduled(cron = "0 0 0 * * *") // 0:00 każdego dnia
    public void pickRandomFinishedPost() {
        List<Post> finishedPosts = postRepository.findByIsFinishedTrue();

        if (finishedPosts.isEmpty()) {
            currentPostOfTheDay = null;
            System.out.println("[PostOfTheDay] No finished posts to choose from.");
            return;
        }

        Random random = new Random();
        currentPostOfTheDay = finishedPosts.get(random.nextInt(finishedPosts.size()));

        System.out.println("[PostOfTheDay] Selected post: " + currentPostOfTheDay.getTitle());
    }
}

