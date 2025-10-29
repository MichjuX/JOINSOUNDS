package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.ChatMessage;
import ms.joinsounds.joinsounds_backend.repository.ChatMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ChatController {
    private final ChatMessageRepository _chatMessageRepository;

    @GetMapping("/public/history/{user1Id}/{user2Id}")
    public List<ChatMessage> getChatHistory(
            @PathVariable UUID user1Id,
            @PathVariable UUID user2Id) {
        return _chatMessageRepository.findChatHistory(user1Id, user2Id);
    }
}

