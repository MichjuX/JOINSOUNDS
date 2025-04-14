package ms.joinsounds.joinsounds_backend.service;

import ms.joinsounds.joinsounds_backend.dto.ReqRes;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserManagementService {
    private final UserRepository userRepository;
    private final JWTUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(UserRepository userRepository,
                                 JWTUtils jwtUtils,
                                 AuthenticationManager authenticationManager,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    public ReqRes register(ReqRes registrationRequest) {
        ReqRes reqRes = new ReqRes();

        try{
            User user = new User();
            user.setUsername(registrationRequest.getUsername());
            user.setEmail(registrationRequest.getEmail());
            user.setFirstName(registrationRequest.getFirstName());
            user.setLastName(registrationRequest.getLastName());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setRole("USER"); // Default role
            User savedUser = userRepository.save(user);
            if(savedUser.getId()!=null){
                reqRes.setUser(savedUser);
                reqRes.setMessage("User registered successfully");
                reqRes.setStatusCode(200);
            }


        } catch (Exception e)
        {
            reqRes.setStatusCode(500);
            reqRes.setError("Registration failed: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes login(ReqRes loginRequest) {
        ReqRes reqRes = new ReqRes();

        try {
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                            loginRequest.getPassword()));
            var user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + loginRequest.getUsername()));
            var jwtToken = jwtUtils.generateToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);
            reqRes.setStatusCode(200);
            reqRes.setToken(jwtToken);
            reqRes.setRefreshToken(refreshToken);
            reqRes.setExpirationTime("24Hrs");
            reqRes.setMessage("User logged in successfully");
        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setError("Login failed: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes refreshToken(ReqRes refreshToken) {
        ReqRes reqRes = new ReqRes();
        try {
            String username = jwtUtils.extractUsername(refreshToken.getToken());
            User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
            if(jwtUtils.isTokenValid(refreshToken.getToken(), user)) {
                var jwtToken = jwtUtils.generateToken(user);
                reqRes.setStatusCode(200);
                reqRes.setToken(jwtToken);
                reqRes.setRefreshToken(refreshToken.getToken());
                reqRes.setExpirationTime("24Hrs");
                reqRes.setMessage("User refreshed successfully");
            }
            reqRes.setStatusCode(500);
            return reqRes;
        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setError("Refresh token failed: " + e.getMessage());
            return reqRes;
        }
    }

    public ReqRes getAllUsers(){
        ReqRes reqRes = new ReqRes();

        try {
            List<User> result = userRepository.findAll();
            if(!result.isEmpty()){
                reqRes.setUsers(result);
                reqRes.setStatusCode(200);
                reqRes.setMessage("Success");
            }
            else{
                reqRes.setStatusCode(404);
                reqRes.setError("No users found");
            }
            return reqRes;
        } catch (Exception e){
            reqRes.setStatusCode(500);
            reqRes.setError("Failed to get users: " + e.getMessage());
            return reqRes;
        }
    }

    public ReqRes getUserById(UUID uuid){
        ReqRes reqRes = new ReqRes();

        try {
            User result = userRepository.findById(uuid).orElseThrow(() -> new RuntimeException("User not found with UUID: " + uuid));
            reqRes.setUser(result);
            reqRes.setStatusCode(200);
            reqRes.setMessage("Success");
        } catch (Exception e){
            reqRes.setStatusCode(500);
            reqRes.setError("Failed to get user: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes deleteUser(UUID uuid){
        ReqRes reqRes = new ReqRes();

        try {
            Optional<User> result = userRepository.findById(uuid);
            if (result.isPresent()) {
                userRepository.deleteById(uuid);
                reqRes.setStatusCode(200);
                reqRes.setMessage("User deleted successfully");
            } else {
                reqRes.setStatusCode(404);
                reqRes.setError("User not found");
            }
        } catch (Exception e){
            reqRes.setStatusCode(500);
            reqRes.setError("Failed to delete user: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes updateUser(UUID uuid, User user){
        ReqRes reqRes = new ReqRes();
        try {
            Optional<User> result = userRepository.findById(reqRes.getUser().getId());
            if (result.isPresent()) {
                User existingUser = result.get();
                existingUser.setUsername(user.getUsername());
                existingUser.setEmail(user.getEmail());
                existingUser.setFirstName(user.getFirstName());
                existingUser.setLastName(user.getLastName());
                existingUser.setRole(user.getRole());

                if(user.getPassword() != null && !user.getPassword().isEmpty()){
                    existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                }

                User savedUser = userRepository.save(existingUser);
                reqRes.setUser(savedUser);
                reqRes.setStatusCode(200);
                reqRes.setMessage("User updated successfully");
            } else{
                reqRes.setStatusCode(404);
                reqRes.setError("User not found");
            }

        } catch (Exception e) {
            reqRes.setStatusCode(500);
            reqRes.setError("Failed to update user: " + e.getMessage());
        }
        return reqRes;
    }

    public ReqRes getMyInfo(){
        ReqRes reqRes = new ReqRes();
        try {
            Optional<User> result = userRepository.findById(reqRes.getUser().getId());
            if (result.isPresent()) {
                reqRes.setUser(result.get());
                reqRes.setStatusCode(200);
                reqRes.setMessage("Success");
            }
            else{
                reqRes.setStatusCode(404);
                reqRes.setError("User not found");
            }
        } catch (Exception e){
            reqRes.setStatusCode(500);
            reqRes.setError("Failed to get user: " + e.getMessage());
        }
        return reqRes;
    }
}
