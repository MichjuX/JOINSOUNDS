package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.CommentDto;
import ms.joinsounds.joinsounds_backend.entity.Comment;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.CommentRepository;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import ms.joinsounds.joinsounds_backend.service.CommentService;
import ms.joinsounds.joinsounds_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentRepository _commentRepository;
    private final CommentService _commentService;
    private final NotificationService _notificationService;
    private final UsersRepository _usersRepository;
    private final PostRepository _postRepository;

    @PostMapping("/authenticated/comment/create")
    public Comment createComment(@RequestBody Comment comment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;
        comment.setUser(user);

        Post post = _postRepository.findById(comment.getPost().getId()).orElse(null);
        User postOwner = _usersRepository.findById(post.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));



        // Notyfikacje
        if(comment.getUser().getId()!=postOwner.getId()) {
            _notificationService.createNotification(postOwner.getId(),
                    "POST_COMMENT",
                    "New comment on your post",
                    comment.getPost().getId(),
                    "POST");
        }

        return _commentRepository.save(comment);
    }

    @GetMapping("/public/comment/all/{postId}")
    public ResponseEntity<List<CommentDto>> getCommentsByPostId(@PathVariable UUID postId) {
        return ResponseEntity.ok(_commentService.getAllCommentsForPost(postId));
    }

    // Dodaję tylko metodę delete do istniejącego kontrolera (reszta pozostaje bez zmian)
    @DeleteMapping("/authenticated/comment/delete/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        _commentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

