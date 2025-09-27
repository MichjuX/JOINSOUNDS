package ms.joinsounds.joinsounds_backend.service;


import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostLikeRepository;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final PostLikeRepository _likeRepository;
    private final PostRepository _postRepository;

    public Page<Post> recommendPostsForUser(UUID userId, Pageable pageable) {
        List<Object[]> likedTags = _likeRepository.countLikesByTagForUser(userId);

        // top 10 tagi
        List<String> topTags = likedTags.stream()
                .map(obj -> (String) obj[0])
                .limit(10)
                .toList();

        if (topTags.isEmpty()) {
            return Page.empty(pageable);
        }

        return _postRepository.findRecommendedPosts(topTags, userId, pageable);
    }
}

