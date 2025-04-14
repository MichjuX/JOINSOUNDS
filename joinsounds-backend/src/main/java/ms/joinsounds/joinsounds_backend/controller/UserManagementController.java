package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.dto.ReqRes;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
public class UserManagementController {
    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ReqRes> register(@RequestBody ReqRes reqRes) {
        return ResponseEntity.ok(userManagementService.register(reqRes));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes reqRes) {
        return ResponseEntity.ok(userManagementService.login(reqRes));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<ReqRes> refresh(@RequestBody ReqRes reqRes) {
        return ResponseEntity.ok(userManagementService.refreshToken(reqRes));
    }

    @GetMapping("/admin/getAllUsers")
    public ResponseEntity<ReqRes> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @GetMapping("/admin/getUsers/{uuid}")
    public ResponseEntity<ReqRes> getUserById(@PathVariable UUID uuid) {
        return ResponseEntity.ok(userManagementService.getUserById(uuid));
    }

    @PutMapping("/admin/update/{uuid}")
    public ResponseEntity<ReqRes> updateUser(@PathVariable UUID uuid, @RequestBody User user) {
        return ResponseEntity.ok(userManagementService.updateUser(uuid, user));
    }

    @GetMapping("/adminuser/get-profile")
    public ResponseEntity<ReqRes> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        ReqRes reqRes = userManagementService.getMyInfo(email);
        return ResponseEntity.status(reqRes.getStatusCode()).body(reqRes);
    }

    @DeleteMapping("/admin/delete/{uuid}")
    public ResponseEntity<ReqRes> deleteUser(@PathVariable UUID uuid) {
        return ResponseEntity.ok(userManagementService.deleteUser(uuid));
    }
}
