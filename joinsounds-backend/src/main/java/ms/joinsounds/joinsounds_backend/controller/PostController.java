package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/authenticated/post")
public class PostController {
    private final PostRepository _postRepository;

    public PostController(PostRepository postRepository) {
        this._postRepository = postRepository;
    }

    @PostMapping("/create")
    public Post createPost(@RequestBody Post post) {
        return _postRepository.save(post);
    }
}
