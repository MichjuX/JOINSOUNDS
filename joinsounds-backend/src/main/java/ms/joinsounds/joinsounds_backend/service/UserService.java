package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.UserRequestDto;
import ms.joinsounds.joinsounds_backend.dto.UserDto;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UsersRepository _usersRepository;
    private final JWTUtils _jwtUtils;
    private final AuthenticationManager _authenticationManager;
    private final PasswordEncoder _passwordEncoder;
    private final EmailService _emailService;
    private final VerificationService _verificationService;

    // Tu ustalamy zawsze rolę USER
    public UserRequestDto register(UserRequestDto registrationRequest){
        UserRequestDto response = new UserRequestDto();

        try {
            // Sprawdź czy email już istnieje
            if (_usersRepository.existsByEmail(registrationRequest.getEmail())) {
                response.setStatusCode(400);
                response.setError("Email already in use");
                return response;
            }

            // Sprawdź czy nazwa użytkownika już istnieje
            if (_usersRepository.existsByName(registrationRequest.getName())) {
                response.setStatusCode(400);
                response.setError("Username already taken");
                return response;
            }
            User user = new User();
            user.setEmail(registrationRequest.getEmail());

            user.setCountry(registrationRequest.getCountry());
            user.setRole("USER");
//            user.setRole(registrationRequest.getRole());
            registerBase(registrationRequest, response, user);

            // Weryfikacja emaila
            var verificationCode = _verificationService.generateVerificationCode();
            var hashedCode = _verificationService.hashVerificationCode(verificationCode);
            var email = _emailService.generateVerificationEmail(registrationRequest.getEmail(),
                    verificationCode,
                    user.getName(),
                    _verificationService.generateVerificationLink(user.getId().toString(), verificationCode));
            _emailService.sendEmail(registrationRequest.getEmail(), "JoinSounds account verification", email);
            _verificationService.saveVerificationCode(user, hashedCode);


        }catch (Exception e){
            response.setStatusCode(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    // Tu ustawiamy role jaką chcemy
    public UserRequestDto adminRegister(UserRequestDto registrationRequest){
        UserRequestDto resp = new UserRequestDto();

        try {
            // Sprawdź czy email już istnieje
            if (_usersRepository.existsByEmail(registrationRequest.getEmail())) {
                resp.setStatusCode(400);
                resp.setError("Email already in use");
                return resp;
            }

            // Sprawdź czy nazwa użytkownika już istnieje
            if (_usersRepository.existsByName(registrationRequest.getName())) {
                resp.setStatusCode(400);
                resp.setError("Username already taken");
                return resp;
            }
            User user = new User();
            user.setEmail(registrationRequest.getEmail());
            user.setCountry(registrationRequest.getCountry());
            user.setRole(registrationRequest.getRole());
            registerBase(registrationRequest, resp, user);

        }catch (Exception e){
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }
        return resp;
    }

    // Powielony kodzik z rejestracji
    private void registerBase(UserRequestDto registrationRequest, UserRequestDto response, User user) {
        user.setName(registrationRequest.getName());
        user.setPassword(_passwordEncoder.encode(registrationRequest.getPassword()));
        User userResult = _usersRepository.save(user);
        if (userResult.getId()!=null) {
            response.setUser((userResult));
            response.setMessage("User Saved Successfully");
            response.setStatusCode(200);
        }
    }

    public UserRequestDto verifyAccount(UUID userId, String verificationCode) {
        UserRequestDto response = new UserRequestDto();
        try {
            Optional<User> userOptional = _usersRepository.findById(userId);
            if (userOptional.isPresent()) {
                if(_verificationService.verifyCode(verificationCode, userId)){
                    User user = userOptional.get();
                    user.setVerified(true);
                    _usersRepository.save(user);
                    _verificationService.removeVerificationCode(userId);
                    response.setStatusCode(200);
                    response.setMessage("Account verified successfully");
                } else {
                    response.setStatusCode(400);
                    response.setMessage("Invalid verification code");
                }
            } else {
                response.setStatusCode(404);
                response.setMessage("User not found");
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred: " + e.getMessage());
        }
        return response;
    }



    public UserRequestDto login(UserRequestDto loginRequest) {
        UserRequestDto response = new UserRequestDto();
        try {
            // Sprawdź czy podana wartość to email czy nazwa użytkownika
            Optional<User> user = loginRequest.getEmail().contains("@")
                    ? _usersRepository.findByEmail(loginRequest.getEmail())
                    : _usersRepository.findByName(loginRequest.getEmail());

            if (user.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("User not found");
                return response;
            }

            if(!user.get().isVerified()){
                response.setStatusCode(401);
                response.setMessage("Verify your account first!");
                return response;
            }

            // Uwierzytelnienie używa   jąc znalezionego użytkownika
            _authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.get().getEmail(), // Spring Security wymaga emaila jako identyfikatora
                            loginRequest.getPassword()
                    )
            );

            var jwt = _jwtUtils.generateToken(user.get());
            var refreshToken = _jwtUtils.generateRefreshToken(new HashMap<>(), user.get());

            response.setStatusCode(200);
            response.setToken(jwt);
            response.setRole(user.get().getRole());
            response.setRefreshToken(refreshToken);
            response.setExpirationTime("24Hrs");
            response.setMessage("Successfully Logged In");

        } catch (BadCredentialsException e) {
            response.setStatusCode(401);
            response.setMessage("Invalid credentials");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Login error: " + e.getMessage());
        }
        return response;
    }

    public UserRequestDto refreshToken(UserRequestDto refreshTokenReqiest){
        UserRequestDto response = new UserRequestDto();
        try{
            String ourEmail = _jwtUtils.extractUsername(refreshTokenReqiest.getToken());
            User users = _usersRepository.findByEmail(ourEmail).orElseThrow();
            if (_jwtUtils.isTokenValid(refreshTokenReqiest.getToken(), users)) {
                var jwt = _jwtUtils.generateToken(users);
                response.setStatusCode(200);
                response.setToken(jwt);
                response.setRefreshToken(refreshTokenReqiest.getToken());
                response.setExpirationTime("24Hr");
                response.setMessage("Successfully Refreshed Token");
            }
            response.setStatusCode(200);
            return response;

        }catch (Exception e){
            response.setStatusCode(500);
            response.setMessage(e.getMessage());
            return response;
        }
    }

    public UserRequestDto getAllUsers() {
        UserRequestDto userRequestDto = new UserRequestDto();

        try {
            List<User> result = _usersRepository.findAll();
            if (!result.isEmpty()) {
                userRequestDto.setUserList(result);
                userRequestDto.setStatusCode(200);
                userRequestDto.setMessage("Successful");
            } else {
                userRequestDto.setStatusCode(404);
                userRequestDto.setMessage("No users found");
            }
            return userRequestDto;
        } catch (Exception e) {
            userRequestDto.setStatusCode(500);
            userRequestDto.setMessage("Error occurred: " + e.getMessage());
            return userRequestDto;
        }
    }

    public UserRequestDto getUsersById(UUID id) {
        UserRequestDto userRequestDto = new UserRequestDto();
        try {
            User usersById = _usersRepository.findById(id).orElseThrow(() -> new RuntimeException("User Not found"));
            userRequestDto.setUser(usersById);
            userRequestDto.setStatusCode(200);
            userRequestDto.setMessage("Users with id '" + id + "' found successfully");
        } catch (Exception e) {
            userRequestDto.setStatusCode(500);
            userRequestDto.setMessage("Error occurred: " + e.getMessage());
        }
        return userRequestDto;
    }

    public UserRequestDto deleteUser(UUID userId) {
        UserRequestDto userRequestDto = new UserRequestDto();
        try {
            Optional<User> userOptional = _usersRepository.findById(userId);
            if (userOptional.isPresent()) {
                _usersRepository.deleteById(userId);
                userRequestDto.setStatusCode(200);
                userRequestDto.setMessage("User deleted successfully");
            } else {
                userRequestDto.setStatusCode(404);
                userRequestDto.setMessage("User not found for deletion");
            }
        } catch (Exception e) {
            userRequestDto.setStatusCode(500);
            userRequestDto.setMessage("Error occurred while deleting user: " + e.getMessage());
        }
        return userRequestDto;
    }

    public UserRequestDto updateUser(UUID userId, User updatedUser) {
        UserRequestDto userRequestDto = new UserRequestDto();
        try {
            Optional<User> userOptional = _usersRepository.findById(userId);
            if (userOptional.isPresent()) {
                User existingUser = userOptional.get();
                existingUser.setEmail(updatedUser.getEmail());
                existingUser.setName(updatedUser.getName());
                existingUser.setCountry(updatedUser.getCountry());
                existingUser.setRole(updatedUser.getRole());

                if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                    existingUser.setPassword(_passwordEncoder.encode(updatedUser.getPassword()));
                }

                User savedUser = _usersRepository.save(existingUser);
                userRequestDto.setUser(savedUser);
                userRequestDto.setStatusCode(200);
                userRequestDto.setMessage("User updated successfully");
            } else {
                userRequestDto.setStatusCode(404);
                userRequestDto.setMessage("User not found for update");
            }
        } catch (Exception e) {
            userRequestDto.setStatusCode(500);
            userRequestDto.setMessage("Error occurred while updating user: " + e.getMessage());
        }
        return userRequestDto;
    }

    public UserRequestDto getMyInfo(String email){
        UserRequestDto userRequestDto = new UserRequestDto();
        try {
            Optional<User> userOptional = _usersRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                userRequestDto.setUser(userOptional.get());
                userRequestDto.setStatusCode(200);
                userRequestDto.setMessage("successful");
            } else {
                userRequestDto.setStatusCode(404);
                userRequestDto.setMessage("User not found for update");
            }

        }catch (Exception e){
            userRequestDto.setStatusCode(500);
            userRequestDto.setMessage("Error occurred while getting user info: " + e.getMessage());
        }
        return userRequestDto;
    }

    public UserDto convertToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setCity(user.getCountry());
        userDto.setRole(user.getRole());
        userDto.setVerified(user.isVerified());
        return userDto;
    }
}