package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.dto.PostDto;
import ms.joinsounds.joinsounds_backend.service.PostService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PostControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc; // Używany do symulowania żądań HTTP

    @MockBean
    private PostService postService; // Mockujemy serwis, by nie angażować Repozytoriów/BD

    @Test
    void shouldReturnAllPostsWithDefaultPaginationAndStatusOk() throws Exception {
        // GIVEN: Przygotowanie danych DTO, które zwróci zamockowany serwis
        PostDto mockDto = new PostDto();
        mockDto.setId(UUID.randomUUID());
        mockDto.setTitle("Testowy Post");

        List<PostDto> postList = Collections.singletonList(mockDto);
        Page<PostDto> postPage = new PageImpl<>(postList);

        // Ustawienie zachowania Mocka: kiedykolwiek wywołana jest metoda getAllPosts z jakimkolwiek Pageable,
        // zwróć naszą przygotowaną stronę (Page)
        when(postService.getAllPosts(any(Pageable.class))).thenReturn(postPage);

        // WHEN & THEN: Wywołanie endpointu i weryfikacja
        mockMvc.perform(get("/public/post/all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()) // Spodziewamy się statusu 200 OK
                .andExpect(jsonPath("$.content[0].title").value("Testowy Post")) // Sprawdzamy zawartość
                .andExpect(jsonPath("$.totalPages").value(1)); // Sprawdzamy paginację
    }

    @Test
    void shouldHandleCustomPaginationParameters() throws Exception {
        // GIVEN: Mockowanie odpowiedzi dla Pageable z niestandardowymi parametrami
        Page<PostDto> emptyPage = new PageImpl<>(Collections.emptyList(), Pageable.ofSize(5).withPage(2), 0);

        when(postService.getAllPosts(any(Pageable.class))).thenReturn(emptyPage);

        // WHEN & THEN: Wywołanie z parametrami ?page=2&size=5&sort=title,asc
        mockMvc.perform(get("/public/post/all")
                        .param("page", "2")
                        .param("size", "5")
                        .param("sort", "title,asc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageable.pageNumber").value(2))
                .andExpect(jsonPath("$.pageable.pageSize").value(5));

        // Możesz dodać weryfikację, czy postService.getAllPosts zostało wywołane z poprawnym Pageable
        // (Wymaga użycia ArgumentCaptor dla pełnej weryfikacji Pageable)
    }
}
