package ms.joinsounds.joinsounds_backend.service;


import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostLikeRepository;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final PostLikeRepository _likeRepository;
    private final PostRepository _postRepository;

    public List<Post> recommendPostsForUser(UUID userId) {
        List<Object[]> likedTags = _likeRepository.countLikesByTagForUser(userId);

        // bierzemy top 3 najpopularniejsze tagi usera
        List<String> topTags = likedTags.stream()
                .map(obj -> (String) obj[0])
                .limit(3)
                .toList();

        if (topTags.isEmpty()) {
            return List.of(); // brak rekomendacji jeśli user nic nie polubił
        }

        return _postRepository.findRecommendedPosts(topTags, userId);
    }
}
