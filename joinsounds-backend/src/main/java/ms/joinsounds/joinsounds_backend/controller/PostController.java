package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/public/post/{id}")
    public PostDto getPostById(@PathVariable UUID id) {
        return _postService.getPostById(id);
    }

    @GetMapping("/public/post/all")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParams[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Page<PostDto> postsPage = _postService.getAllPosts(pageable);
        return ResponseEntity.ok(postsPage);
    }

    @DeleteMapping("/authenticated/post/delete/{id}")
    public void deletePost(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        Post post = _postRepository.findById(id).orElse(null);
        if (post != null && post.getUser().getId().equals(user.getId())) {
            _postRepository.delete(post);
        }
    }
}
