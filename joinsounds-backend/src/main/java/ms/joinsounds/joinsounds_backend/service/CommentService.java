package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.CommentDto;
import ms.joinsounds.joinsounds_backend.entity.Comment;
import ms.joinsounds.joinsounds_backend.repository.CommentRepository;
import ms.joinsounds.joinsounds_backend.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository _commentRepository;
    private final UserProfileRepository _userProfileRepository;
    private final UserService _userService;

    public List<CommentDto> getAllCommentsForPost(UUID postId) {
        List<Comment> comments = _commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        List<CommentDto> commentDtos = new ArrayList<>();
        for (Comment comment : comments) {
            commentDtos.add(convertToDto(comment));
        }
        return commentDtos;
    }
    private CommentDto convertToDto(Comment comment) {
        CommentDto commentDto = new CommentDto();
        commentDto.setId(comment.getId());
        commentDto.setContent(comment.getContent());
        commentDto.setStartTime(comment.getStartTime());
        commentDto.setEndTime(comment.getEndTime());
        commentDto.setColor(comment.getColor());
        commentDto.setCreatedAt(comment.getCreatedAt());
        commentDto.setUser(_userService.convertToDto(comment.getUser()));
        commentDto.setUserProfilePicturePath(_userProfileRepository.findProfilePicturePathByUserId(comment.getUser().getId()));

        return commentDto;
    }
}
