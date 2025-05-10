package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.service.PostService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class PostController {
    private final PostRepository _postRepository;
    private final PostService _postService;

    public PostController(PostRepository postRepository, PostService postService) {
        this._postRepository = postRepository;
        _postService = postService;
    }

    @PostMapping("/authenticated/post/create")
    public Post createPost(@RequestBody Post post) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        post.setUser(user);
        return _postRepository.save(post);
    }

//    @GetMapping("/public/post/{id}")
//    public ResponseEntity<Post> getPostById(@PathVariable UUID id) {
//        return _postRepository.findById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
    @GetMapping("/public/post/{id}")
    public PostDto getPostById(@PathVariable UUID id) {
        return _postService.getPostById(id);
    }


    @GetMapping("/public/post/all")
    public List<PostDto> getAllPosts() {
        return _postService.getAllPosts();
    }
}
