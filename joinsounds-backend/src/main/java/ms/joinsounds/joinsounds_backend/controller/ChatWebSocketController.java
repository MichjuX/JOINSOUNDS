package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.ChatMessage;
import ms.joinsounds.joinsounds_backend.repository.ChatMessageRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import ms.joinsounds.joinsounds_backend.service.NotificationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageRepository _chatMessageRepository;
    private final UsersRepository _userRepository;
    private final SimpMessagingTemplate _messagingTemplate;
    private final NotificationService _notificationService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageDto dto) {
        var sender = _userRepository.findById(dto.senderId())
                .orElseThrow();
        var receiver = _userRepository.findById(dto.receiverId())
                .orElseThrow();

        ChatMessage msg = new ChatMessage();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(dto.content());
        msg.setTimestamp(LocalDateTime.now());

        _chatMessageRepository.save(msg);

        // Wysyłamy TYLKO do odbiorcy
        _messagingTemplate.convertAndSend("/topic/chat." + dto.receiverId(), msg);

        // Opcjonalnie wysyłamy też do nadawcy (żeby zobaczył swoją wiadomość)
        _messagingTemplate.convertAndSend("/topic/chat." + dto.senderId(), msg);

        if(!dto.senderId().equals(dto.receiverId())) {
            _notificationService.createNotification(
                    dto.receiverId(),
                    "NEW_MESSAGE",
                    "New message from " + sender.getName(),
                    dto.senderId,
                    "CHAT"
            );
        }
    }

    public record ChatMessageDto(UUID senderId, UUID receiverId, String content) {}
}
