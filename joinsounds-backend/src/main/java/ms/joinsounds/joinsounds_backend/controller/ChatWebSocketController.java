package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.ChatMessage;
import ms.joinsounds.joinsounds_backend.repository.ChatMessageRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageRepository chatMessageRepository;
    private final UsersRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageDto dto) {
        var sender = userRepository.findById(dto.senderId())
                .orElseThrow();
        var receiver = userRepository.findById(dto.receiverId())
                .orElseThrow();

        ChatMessage msg = new ChatMessage();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(dto.content());
        msg.setTimestamp(LocalDateTime.now());

        chatMessageRepository.save(msg);

        // 🔹 Wysyłamy TYLKO do odbiorcy
        messagingTemplate.convertAndSend("/topic/chat." + dto.receiverId(), msg);

        // 🔹 Opcjonalnie wysyłamy też do nadawcy (żeby zobaczył swoją wiadomość)
        messagingTemplate.convertAndSend("/topic/chat." + dto.senderId(), msg);
    }

    public record ChatMessageDto(UUID senderId, UUID receiverId, String content) {}
}
