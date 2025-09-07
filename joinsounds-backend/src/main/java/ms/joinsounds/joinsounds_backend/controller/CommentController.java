package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.entity.Comment;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.CommentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CommentController {
    private final CommentRepository _commentRepository;

    public CommentController(CommentRepository commentRepository) {
        this._commentRepository = commentRepository;
    }

    @PostMapping("/authenticated/comment/create")
    public Comment createComment(@RequestBody Comment comment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;
        comment.setUser(user);
        return _commentRepository.save(comment);
    }

    @GetMapping("/public/comment/all/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable UUID postId) {
        List<Comment> comments = _commentRepository.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Dodaję tylko metodę delete do istniejącego kontrolera (reszta pozostaje bez zmian)
    @DeleteMapping("/authenticated/comment/delete/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        _commentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

