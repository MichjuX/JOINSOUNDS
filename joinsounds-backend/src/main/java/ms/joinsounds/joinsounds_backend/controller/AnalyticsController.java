package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.AnalyticsDto;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.service.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService _analyticsService;

    @GetMapping("/authenticated/analytics/user")
    public AnalyticsDto getUserAnalytics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        return _analyticsService.getAnalyticsForUser(user);
    }
}
