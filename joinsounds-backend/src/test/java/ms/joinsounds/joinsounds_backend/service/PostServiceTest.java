package ms.joinsounds.joinsounds_backend.service;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.dto.UserDto;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PostServiceTest {

    @Mock
    private PostRepository _postRepository;

    @Mock
    private UserService _userService;

    @Mock
    private FileStorageService _fileStorageService;

    @InjectMocks
    private PostService _postService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllPosts() {
        Pageable pageable = PageRequest.of(0, 10);
        Post post = new Post();
        post.setId(UUID.randomUUID());
        post.setTitle("Test Title");
        post.setContent("Test Content");
        post.setAudioFilePath("test/path/to/audio.mp3");
        post.setCreatedAt(LocalDateTime.now());
        var testuser = new User();
        when(_userService.convertToDto(post.getUser())).thenReturn(new UserDto());
        var testDtoUser = _userService.convertToDto(testuser);
        post.setUser(testuser);

        Page<Post> singlePostPage = new PageImpl<>(Collections.singletonList(post), pageable, 1);

        when(_postRepository.findAll(pageable)).thenReturn(singlePostPage);

        Page<PostDto> result = _postService.getAllPosts(pageable);

        assertNotNull(result);
        assertTrue(result.hasContent());
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Title", result.getContent().getFirst().getTitle());
        assertEquals("Test Content", result.getContent().getFirst().getContent());
        assertEquals("test/path/to/audio.mp3", result.getContent().getFirst().getAudioFilePath());
        assertEquals(testDtoUser, result.getContent().getFirst().getUser());
        assertNotNull(result.getContent().getFirst().getCreatedAt());

        verify(_postRepository, times(1)).findAll(pageable);
        verify(_userService, times(2)).convertToDto(post.getUser());
        verifyNoMoreInteractions(_postRepository, _userService);

    }

    @Test
    void getPostById() {
    }

    @Test
    void deletePostByModerator() {
    }
}