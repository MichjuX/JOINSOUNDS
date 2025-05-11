package ms.joinsounds.joinsounds_backend.service;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {
    private final PostRepository _postRepository;
    private final UserService _userService;
    private final FileStorageService _fileStorageService;

    public PostService(PostRepository postRepository,
                       UserService userService,
                       FileStorageService fileStorageService) {
        this._postRepository = postRepository;
        this._userService = userService;
        _fileStorageService = fileStorageService;
    }

    public Page<PostDto> getAllPosts(Pageable pageable) {
        Page<Post> postsPage = _postRepository.findAll(pageable);

        return postsPage.map(post -> {
            PostDto postDto = new PostDto();
            postDto.setId(post.getId());
            postDto.setTitle(post.getTitle());
            postDto.setContent(post.getContent());
            postDto.setCreatedAt(post.getCreatedAt());
            if (post.getUser() != null) {
                postDto.setUser(_userService.convertToDto(post.getUser()));
            }
            postDto.setAudioFilePath(post.getAudioFilePath());
            return postDto;
        });
    }

    public PostDto getPostById(UUID id){
            Post post = _postRepository.findById(id).orElse(null);
            if (post != null) {
                PostDto postDto = new PostDto();
                postDto.setId(post.getId());
                postDto.setTitle(post.getTitle());
                postDto.setContent(post.getContent());
                if (post.getUser() != null) postDto.setUser(_userService.convertToDto(post.getUser()));
                postDto.setAudioFilePath(post.getAudioFilePath());
                return postDto;
            }
            return new PostDto();
    }
    public void deletePostByModerator(UUID id, String role) {
        Post post = _postRepository.findById(id).orElse(null);
        if (post != null) {
            post.setTitle("Post removed by " + role.toLowerCase());
            post.setContent("");
            post.setAudioFilePath(null);
            _postRepository.save(post);
            String audioFilePath = post.getAudioFilePath();
            if (audioFilePath != null && !audioFilePath.isEmpty()) {
                _fileStorageService.deleteFile(audioFilePath);
            }
        }
    }
}
