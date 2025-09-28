package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.AnalyticsDto;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.CommentRepository;
import ms.joinsounds.joinsounds_backend.repository.PostLikeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final PostLikeRepository _postLikeRepository;
    private final CommentRepository _commentRepository;

    public AnalyticsDto getAnalyticsForUser(User user) {
        AnalyticsDto analyticsDto = new AnalyticsDto();
        analyticsDto.setUserTotalComments(_commentRepository.countTotalCommentsByUser(user.getId()));
        analyticsDto.setUserTotalLikes(_postLikeRepository.countTotalLikesByUser(user.getId()));
        analyticsDto.setUserLastWeekComments(_commentRepository.countCommentsSinceByUser(user.getId(), LocalDateTime.now().minusWeeks(1)));
        analyticsDto.setUserLastWeekLikes(_postLikeRepository.countLikesSinceByUser(user.getId(), LocalDateTime.now().minusWeeks(1)));
        return analyticsDto;
    }
}
