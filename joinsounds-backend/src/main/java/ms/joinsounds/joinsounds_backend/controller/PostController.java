package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.service.FileStorageService;
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
    private final FileStorageService _fileStorageService;

    public PostController(PostRepository postRepository,
                          PostService postService,
                          FileStorageService fileStorageService) {
        this._postRepository = postRepository;
        _postService = postService;
        _fileStorageService = fileStorageService;
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
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Post post = _postRepository.findById(id).orElse(null);
        String audioFilePath = "";
        if (post != null ) {
            audioFilePath = post.getAudioFilePath();
        }
        if (post != null && post.getUser().getId().equals(user.getId())) {
            _postRepository.delete(post);
            if (audioFilePath != null && !audioFilePath.isEmpty()) {
                _fileStorageService.deleteFile(audioFilePath);
            }
            return ResponseEntity.ok().build();
        }
        String role = user.getRole();
        if(post != null && (role.equals("ADMIN") || role.equals("MODERATOR"))){
            _postRepository.delete(post);
            if (audioFilePath != null && !audioFilePath.isEmpty()) {
                _fileStorageService.deleteFile(audioFilePath);
            }
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/moderator/post/delete/{id}")
    public ResponseEntity<Void> deletePostByModerator(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        _postService.deletePostByModerator(id, user.getRole());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/authenticated/post/update/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable UUID id, @RequestBody Post post) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Post existingPost = _postRepository.findById(id).orElse(null);
        if (existingPost != null && existingPost.getUser().getId().equals(user.getId())) {
            existingPost.setTitle(post.getTitle());
            existingPost.setContent(post.getContent());
            return ResponseEntity.ok(_postRepository.save(existingPost));
        }
        return ResponseEntity.notFound().build();
    }
}
