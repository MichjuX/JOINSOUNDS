package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.UserProfileDto;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.entity.UserProfile;
import ms.joinsounds.joinsounds_backend.repository.PostRepository;
import ms.joinsounds.joinsounds_backend.repository.UserProfileRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import ms.joinsounds.joinsounds_backend.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class UserProfileController {
    private final UsersRepository _usersRepository;
    private final UserProfileRepository _userProfileRepository;
    private final PostRepository _postRepository;
    private final FileStorageService _fileStorageService;

    @GetMapping("/public/user/profile/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable UUID userId) {
        User user = _usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile userProfileEntity = _userProfileRepository.findByUser(user);

        UserProfileDto userProfile = new UserProfileDto();
        userProfile.setId(user.getId());
        userProfile.setUsername(user.getName());
        userProfile.setPostCount(_postRepository.countByUser(user));

        if (userProfileEntity != null) {
            userProfile.setBio(userProfileEntity.getBio());
            userProfile.setTools(userProfileEntity.getTools());
            userProfile.setGenres(userProfileEntity.getGenres());
            userProfile.setProfilePictureUrl(userProfileEntity.getProfilePicturePath());
        } else {
            // Domyślne wartości jeśli profil nie istnieje
            userProfile.setBio("");
            userProfile.setTools(new ArrayList<>());
            userProfile.setGenres(new ArrayList<>());
            userProfile.setProfilePictureUrl(null);
        }

        return ResponseEntity.ok(userProfile);
    }

    @GetMapping("/authenticated/user/profilePicturePath")
    public ResponseEntity<String> getAuthenticatedUserProfilePicturePath() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;

        UserProfile userProfile = _userProfileRepository.findByUser(user);
        String profilePicturePath = userProfile != null ? userProfile.getProfilePicturePath() : null;

        return ResponseEntity.ok(profilePicturePath);
    }

    @PutMapping("/authenticated/user/profile/update")
    public ResponseEntity<UserProfileDto> updateUserProfile(@RequestBody UserProfileDto userProfileDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;

        UserProfile userProfile = _userProfileRepository.findByUser(user);

        if (userProfile == null) {
            userProfile = new UserProfile();
            userProfile.setUser(user);
        }

        userProfile.setBio(userProfileDto.getBio());
        userProfile.setTools(userProfileDto.getTools());
        userProfile.setGenres(userProfileDto.getGenres());

        _userProfileRepository.save(userProfile);

        return ResponseEntity.ok(userProfileDto);
    }

    @PostMapping("/authenticated/user/profile/upload-picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            // Walidacja typu MIME dla obrazów
            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Walidacja rozmiaru pliku (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File too large. Maximum size is 5MB");
            }

            String fileName = _fileStorageService.storeProfilePicture(file);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;

            UserProfile userProfile = _userProfileRepository.findByUser(user);
            if (userProfile == null) {
                userProfile = new UserProfile();
                userProfile.setUser(user);
            }

            if (userProfile.getProfilePicturePath() != null) {
                _fileStorageService.deleteFile(userProfile.getProfilePicturePath());
            }

            userProfile.setProfilePicturePath(fileName);
            _userProfileRepository.save(userProfile);

            return ResponseEntity.ok(fileName);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload profile picture: " + e.getMessage());
        }
    }

    @DeleteMapping("/authenticated/user/profile/remove-picture")
    public ResponseEntity<?> removeProfilePicture() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = auth.getPrincipal() instanceof User ? (User) auth.getPrincipal() : null;

            UserProfile userProfile = _userProfileRepository.findByUser(user);
            if (userProfile != null && userProfile.getProfilePicturePath() != null) {

                _fileStorageService.deleteFile(userProfile.getProfilePicturePath());

                userProfile.setProfilePicturePath(null);
                _userProfileRepository.save(userProfile);
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to remove profile picture: " + e.getMessage());
        }
    }
}
