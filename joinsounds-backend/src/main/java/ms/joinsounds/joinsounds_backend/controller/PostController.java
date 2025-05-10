package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class PostController {
    private final PostRepository _postRepository;

    public PostController(PostRepository postRepository) {
        this._postRepository = postRepository;
    }

    @PostMapping("/authenticated/post/create")
    public Post createPost(@RequestBody Post post) {
        return _postRepository.save(post);
    }

    @GetMapping("/public/post/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable UUID id) {
        return _postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/post/all")
    public List<Post> getAllPosts() {
        return _postRepository.findAll();
    }
}
