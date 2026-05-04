package com.devsuperior.dscatalog.services;

import com.devsuperior.dscatalog.dto.EmailDTO;
import com.devsuperior.dscatalog.entities.PasswordRecover;
import com.devsuperior.dscatalog.entities.User;
import com.devsuperior.dscatalog.repositories.PasswordRecoveryRepository;
import com.devsuperior.dscatalog.repositories.UserRepository;
import com.devsuperior.dscatalog.services.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    @Value("${email.password-recover.token.minutes}")
    private Long tokenMinutes;

    @Value("${email.password-recover.uri}")
    private String recoverUri;


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordRecoveryRepository passwordRecoveryRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void createRecoverToken(@Valid EmailDTO body) {

        User user = userRepository.findByEmail(body.getEmail());
        if (user == null) {
            throw new ResourceNotFoundException("Email não encontrado");
        }

        String token = UUID.randomUUID().toString();

        PasswordRecover entity = new PasswordRecover();
        entity.setEmail(body.getEmail());
        entity.setToken(token);
        entity.setExpiration(Instant.now().plusSeconds(tokenMinutes * 60L));
        entity = passwordRecoveryRepository.save(entity);

        String text = "Acesse o link para definir uma nova senha\n\n"
                +  recoverUri +  token;

        emailService.sendEmail(body.getEmail(), "Recuperação de senha", text );
    }
}
