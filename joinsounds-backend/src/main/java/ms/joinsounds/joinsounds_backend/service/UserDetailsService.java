package ms.joinsounds.joinsounds_backend.service;

import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UsersRepository _usersRepository;

    public UserDetailsService(UsersRepository _usersRepository) {
        this._usersRepository = _usersRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return _usersRepository.findByEmail(username).orElseThrow();
    }

}
