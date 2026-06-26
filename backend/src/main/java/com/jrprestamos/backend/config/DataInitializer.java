package com.jrprestamos.backend.config;

import com.jrprestamos.backend.entity.EstadoPrestamo;
import com.jrprestamos.backend.entity.Prestamo;
import com.jrprestamos.backend.entity.Usuario;
import com.jrprestamos.backend.repository.PrestamoRepository;
import com.jrprestamos.backend.repository.UsuarioRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PrestamoRepository prestamoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           PrestamoRepository prestamoRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.prestamoRepository = prestamoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Create admin user
        Usuario admin = Usuario.builder()
                .nombre("Administrador")
                .email("admin@test.com")
                .password(passwordEncoder.encode("123"))
                .role("ROLE_ADMIN")
                .build();
        admin = usuarioRepository.save(admin);

        // Create regular user
        Usuario usuario = Usuario.builder()
                .nombre("Usuario de Prueba")
                .email("usuario@test.com")
                .password(passwordEncoder.encode("123"))
                .role("ROLE_USER")
                .build();
        usuario = usuarioRepository.save(usuario);

        // Create sample loans
        prestamoRepository.save(Prestamo.builder()
                .monto(150000.0)
                .plazo(12)
                .fechaSolicitud(LocalDateTime.now().minusDays(10))
                .estado(EstadoPrestamo.PENDIENTE)
                .usuario(usuario)
                .build());

        prestamoRepository.save(Prestamo.builder()
                .monto(300000.0)
                .plazo(24)
                .fechaSolicitud(LocalDateTime.now().minusDays(5))
                .estado(EstadoPrestamo.APROBADO)
                .usuario(usuario)
                .build());

        prestamoRepository.save(Prestamo.builder()
                .monto(75000.0)
                .plazo(6)
                .fechaSolicitud(LocalDateTime.now().minusDays(2))
                .estado(EstadoPrestamo.RECHAZADO)
                .usuario(usuario)
                .build());
    }
}
