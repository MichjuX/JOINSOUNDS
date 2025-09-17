package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/authenticated/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService _recommendationService;

    @GetMapping("/{userId}")
    public List<Post> getRecommendations(@PathVariable UUID userId) {
        return _recommendationService.recommendPostsForUser(userId);
    }
}

