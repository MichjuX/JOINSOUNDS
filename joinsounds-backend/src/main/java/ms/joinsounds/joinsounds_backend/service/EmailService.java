package ms.joinsounds.joinsounds_backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EmailService {
    private final JavaMailSender _javaMailSender;

    public void sendEmail(String to, String subject, String text) {
        try{
            MimeMessage message = _javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // True bo to HTML
            helper.setFrom("joinsounds.contact@gmail.com");
            _javaMailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send email");
        }
    }
    public String generateVerificationEmail(String email,
                                            String verificationCode,
                                            String name,
                                            String link) {

        return "<html>"
                + "<body style='font-family: Arial, sans-serif;'>"
                + "<h2 style='color: #2c3e50;'>Welcome to JoinSounds, " + name + "!</h2>"
                + "<p>Thank you for registering. Here's your verification code:</p>"
                + "<div style='background: #f8f9fa; padding: 10px; margin: 15px 0; "
                + "border-left: 4px solid #3498db; font-size: 20px; font-weight: bold;'>"
                + verificationCode
                + "</div>" +
                "<p>You can also use this link to verify your account: </p>"
                + link
//                + "<p>This code will expire in 24 hours.</p>"
                + "</body>"
                + "</html>";
    }

}
