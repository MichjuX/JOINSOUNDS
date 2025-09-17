package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.PostLikeDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.PostLike;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostLikeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostLikeService {
    private final PostLikeRepository _postLikeRepository;

    public List<PostLikeDto> getPostLikes(Post post) {
        return _postLikeRepository.findAllByPost(post)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Integer getPostLikesCount(Post post) {
        return Math.toIntExact(_postLikeRepository.countByPost(post));
    }

    public PostLikeDto convertToDto(PostLike postLike) {
        PostLikeDto postLikeDto = new PostLikeDto();
        postLikeDto.setUserId(postLike.getUser().getId());
        postLikeDto.setUserNickname(postLike.getUser().getName());
        postLikeDto.setLikedAt(postLike.getCreatedAt());
        return postLikeDto;
    }

    public Boolean isPostLikedByUser(Post post, User user) {
        return _postLikeRepository.existsByPostAndUser(post, user);
    }
}
