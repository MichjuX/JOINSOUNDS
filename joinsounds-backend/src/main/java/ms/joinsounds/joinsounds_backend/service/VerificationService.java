package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.entity.VerificationToken;
import ms.joinsounds.joinsounds_backend.repository.VerificationTokenRepository;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class VerificationService {

    private final VerificationTokenRepository _verificationTokenRepository;
    private final String baseUrl = "http://172.24.188.59:5173"; // Change this to your actual base URL

    public String generateVerificationCode() {
        // Generate a random 6-digit verification code
        int code = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(code);
    }

    public String hashVerificationCode(String rawCode) {
        return BCrypt.hashpw(rawCode, BCrypt.gensalt());
    }

    public boolean verifyCode(String rawCode, String hashedCode) {
        return BCrypt.checkpw(rawCode, hashedCode);
    }

    public boolean verifyCode(String rawCode, UUID userId) {
        Optional<VerificationToken> tokenOptional = _verificationTokenRepository.findByUserId(userId);
        if (tokenOptional.isPresent()) {
            VerificationToken token = tokenOptional.get();
            return verifyCode(rawCode, token.getToken());
        }
        return false;
    }

    public void saveVerificationCode(User user, String hashedCode) {
        var token = new VerificationToken();
        token.setToken(hashedCode);
        token.setUser(user);
        _verificationTokenRepository.save(token);
        System.out.println("Verification code saved: " + hashedCode);
    }

    public String generateVerificationLink(String userid, String token) {
        return baseUrl + "/verify-account/" + userid + "?token=" + token;
    }

    public void removeVerificationCode(UUID userId) {
        VerificationToken token = _verificationTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        _verificationTokenRepository.delete(token);
    }




}
