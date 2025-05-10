package ms.joinsounds.joinsounds_backend.service;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {
    private final PostRepository _postRepository;
    private final UserService _userService;

    public PostService(PostRepository postRepository, UserService userService) {
        this._postRepository = postRepository;
        this._userService = userService;
    }

    public List<PostDto> getAllPosts() {
        List <PostDto> postsDto = new ArrayList<PostDto>();
        List<Post> posts = _postRepository.findAll();
        for (Post post : posts) {
            PostDto postDto = new PostDto();
            postDto.setId(post.getId());
            postDto.setTitle(post.getTitle());
            postDto.setContent(post.getContent());
            if (post.getUser() != null) postDto.setUser(_userService.convertToDto(post.getUser()));
            postDto.setAudioFilePath(post.getAudioFilePath());
            postsDto.add(postDto);
        }
        return postsDto;
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
}
