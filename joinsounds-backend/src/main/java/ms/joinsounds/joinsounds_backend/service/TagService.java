package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.Post;
import ms.joinsounds.joinsounds_backend.entity.Tag;
import ms.joinsounds.joinsounds_backend.repository.TagRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository _tagRepository;

    @Transactional(propagation = Propagation.MANDATORY) // Wymaga istniejącej transakcji
    public Set<Tag> processTags(String tagsString) {
        if (tagsString == null || tagsString.trim().isEmpty()) {
            return new HashSet<>();
        }

        return Arrays.stream(tagsString.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .map(this::getOrCreateTag)
                .collect(Collectors.toSet());
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public Tag getOrCreateTag(String tagName) {
        String normalizedName = tagName.toLowerCase();
        return _tagRepository.findByName(normalizedName)
                .orElseGet(() -> _tagRepository.save(new Tag(normalizedName)));
    }
}