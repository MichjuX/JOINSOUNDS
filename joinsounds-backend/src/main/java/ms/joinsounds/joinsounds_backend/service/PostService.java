package ms.joinsounds.joinsounds_backend.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.dto.PostRequest;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.Tag;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository _postRepository;
    private final UserService _userService;
    private final FileStorageService _fileStorageService;
    private final TagService _tagService;


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
                if (post.getUser() != null) {
                    postDto.setUser(_userService.convertToDto(post.getUser()));
                }
                postDto.setAudioFilePath(post.getAudioFilePath());

                postDto.setTags(post.getTags().stream()
                        .map(Tag::getName)
                        .collect(Collectors.toList()));

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

    // W serwisie
    @Transactional
    public Post createPostWithTags(Post post, String tagsString) {
        try {
            System.out.println("START: Creating post with tags");

            // Przetwórz tagi
            if (tagsString != null && !tagsString.trim().isEmpty()) {
                System.out.println("Processing tags: " + tagsString);
                Set<Tag> tags = _tagService.processTags(tagsString);
                post.setTags(tags);
                System.out.println("Tags processed: " + tags.size());
            }

            // Zapisz posta
            System.out.println("Saving post...");
            Post savedPost = _postRepository.save(post);
            System.out.println("Post saved with ID: " + savedPost.getId());

            return savedPost;

        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
