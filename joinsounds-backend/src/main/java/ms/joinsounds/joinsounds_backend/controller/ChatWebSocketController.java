package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.ChatMessage;
import ms.joinsounds.joinsounds_backend.repository.ChatMessageRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageRepository chatMessageRepository;
    private final UsersRepository userRepository;

    // Odbiera wiadomość z frontu (/app/chat.sendMessage) i rozsyła na /topic/chat.{receiverId}
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/chat")
    public ChatMessage sendMessage(ChatMessageDto dto) {
        var sender = userRepository.findById(dto.senderId())
                .orElseThrow();
        var receiver = userRepository.findById(dto.receiverId())
                .orElseThrow();

        ChatMessage msg = new ChatMessage();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(dto.content());
        msg.setTimestamp(LocalDateTime.now());

        return chatMessageRepository.save(msg);
    }

    public record ChatMessageDto(UUID senderId, UUID receiverId, String content) {}
}

