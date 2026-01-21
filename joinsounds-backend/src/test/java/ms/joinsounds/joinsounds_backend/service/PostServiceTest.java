package ms.joinsounds.joinsounds_backend.service;

import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.PostLike;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.PostLikeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostLikeRepository postLikeRepository;

    @InjectMocks
    private PostService postService; // Wstrzykuje Mocki do tej klasy

    private User testUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testPost = new Post();
        testPost.setId(UUID.randomUUID());
    }

    // --- TESTY JEDNOSTKOWE dla likePost ---

    @Test
    void shouldCreateLikeWhenPostIsNotLiked() {
        // GIVEN: Użytkownik jeszcze nie polubił posta
        when(postLikeRepository.findByPostAndUser(testPost, testUser)).thenReturn(Optional.empty());

        // WHEN: Wywołanie metody likePost
        postService.likePost(testUser, testPost);

        // THEN: Weryfikacja, że metoda .save() została wywołana DOKŁADNIE raz
        verify(postLikeRepository, times(1)).save(any(PostLike.class));
        // Weryfikacja, że metoda .delete() nie została wywołana
        verify(postLikeRepository, never()).delete(any(PostLike.class));
    }

    @Test
    void shouldDeleteLikeWhenPostIsAlreadyLiked() {
        // GIVEN: Użytkownik już polubił posta
        PostLike existingLike = new PostLike();
        when(postLikeRepository.findByPostAndUser(testPost, testUser)).thenReturn(Optional.of(existingLike));

        // WHEN: Wywołanie metody likePost
        postService.likePost(testUser, testPost);

        // THEN: Weryfikacja, że metoda .delete() została wywołana DOKŁADNIE raz
        verify(postLikeRepository, times(1)).delete(existingLike);
        // Weryfikacja, że metoda .save() nie została wywołana
        verify(postLikeRepository, never()).save(any(PostLike.class));
    }
}