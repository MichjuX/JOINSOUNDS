package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.UserProfileDto;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.entity.UserProfile;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.repository.UserProfileRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class UserProfileController {
    private final UsersRepository _usersRepository;
    private final UserProfileRepository _userProfileRepository;
    private final PostRepository _postRepository;

    @GetMapping("/public/user/profile/{UUID}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable UUID UUID) {
        // Implement the logic to fetch user profile by UUID
        UserProfileDto userProfile = new UserProfileDto();
        User user = _usersRepository.findById(UUID).orElse(null);
        UserProfile userProfileEntity = _userProfileRepository.findByUser(user);
        // Populate userProfile with data
        userProfile.setUsername(_usersRepository.findById(UUID).get().getName());

        userProfile.setProfilePictureUrl(null);
        userProfile.setBio(userProfileEntity.getBio());
        userProfile.setTools(userProfileEntity.getTools());
        userProfile.setGenres(userProfileEntity.getGenres());
        userProfile.setPostCount(_postRepository.countByUser(user));

        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/authenticated/user/profile/update")
    public ResponseEntity<UserProfileDto> updateUserProfile(@RequestBody UserProfileDto userProfileDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;

        // Szukamy profilu, jeśli nie istnieje - tworzymy nowy
        UserProfile userProfile = _userProfileRepository.findByUser(user);

        if (userProfile == null) {
            userProfile = new UserProfile();
            userProfile.setUser(user); // Pamiętaj o ustawieniu użytkownika!
        }

        // Aktualizujemy dane
        userProfile.setBio(userProfileDto.getBio());
        userProfile.setTools(userProfileDto.getTools());
        userProfile.setGenres(userProfileDto.getGenres());

        _userProfileRepository.save(userProfile);

        return ResponseEntity.ok(userProfileDto);
    }
}
