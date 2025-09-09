package ms.joinsounds.joinsounds_backend.repository;

import ms.joinsounds.joinsounds_backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query("SELECT cm FROM ChatMessage cm WHERE " +
            "(cm.sender.id = :user1Id AND cm.receiver.id = :user2Id) OR " +
            "(cm.sender.id = :user2Id AND cm.receiver.id = :user1Id) " +
            "ORDER BY cm.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("user1Id") UUID user1Id,
                                      @Param("user2Id") UUID user2Id);
}
