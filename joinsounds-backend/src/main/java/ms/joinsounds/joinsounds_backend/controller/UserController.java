package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.dto.UserRequestDto;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class UserController {
    private final UserService _userService;

    public UserController(UserService _userService) {
        this._userService = _userService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<UserRequestDto> register(@RequestBody UserRequestDto req) {
        UserRequestDto response = _userService.register(req);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/auth/verify-account/{userId}/{verificationCode}")
    public ResponseEntity<UserRequestDto> verifyAccount(@PathVariable UUID userId, @PathVariable String verificationCode) {
        UserRequestDto response = _userService.verifyAccount(userId, verificationCode);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/admin/register")
    public ResponseEntity<UserRequestDto> adminRegister(@RequestBody UserRequestDto req) {
        UserRequestDto response = _userService.adminRegister(req);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<UserRequestDto> login(@RequestBody UserRequestDto req){
        UserRequestDto response = _userService.login(req);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<UserRequestDto> refreshToken(@RequestBody UserRequestDto req){
        return ResponseEntity.ok(_userService.refreshToken(req));
    }

    @GetMapping("/admin/get-all-users")
    public ResponseEntity<UserRequestDto> getAllUsers(){
        return ResponseEntity.ok(_userService.getAllUsers());
    }

    @GetMapping("/admin/get-users/{userId}")
    public ResponseEntity<UserRequestDto> getUserByID(@PathVariable UUID userId){
        return ResponseEntity.ok(_userService.getUsersById(userId));
    }

    @PutMapping("/admin/update/{userId}")
    public ResponseEntity<UserRequestDto> updateUser(@PathVariable UUID userId, @RequestBody User reqres){
        return ResponseEntity.ok(_userService.updateUser(userId, reqres));
    }

    @GetMapping("/authenticated/get-profile")
    public ResponseEntity<UserRequestDto> getMyProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserRequestDto response = _userService.getMyInfo(email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/admin/delete/{userId}")
    public ResponseEntity<UserRequestDto> deleteUser(@PathVariable UUID userId){
        return ResponseEntity.ok(_userService.deleteUser(userId));
    }

    @GetMapping("/public/getCurrentUserId")
    public ResponseEntity<UUID> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Sprawdź, czy użytkownik jest zalogowany (nie jest "anonymousUser")
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.ok(null);  // Zwraca HTTP 200 z null
        }

        // Jeśli użytkownik jest zalogowany, zwróć jego ID
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user.getId());
    }
}