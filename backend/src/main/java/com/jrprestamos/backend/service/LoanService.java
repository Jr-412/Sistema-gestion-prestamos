package com.jrprestamos.backend.service;

import com.jrprestamos.backend.dto.LoanRequest;
import com.jrprestamos.backend.dto.LoanResponse;
import com.jrprestamos.backend.entity.EstadoPrestamo;
import com.jrprestamos.backend.entity.Prestamo;
import com.jrprestamos.backend.entity.Usuario;
import com.jrprestamos.backend.exception.ResourceNotFoundException;
import com.jrprestamos.backend.repository.PrestamoRepository;
import com.jrprestamos.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {

    private final PrestamoRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;

    public LoanService(PrestamoRepository prestamoRepository,
                       UsuarioRepository usuarioRepository) {
        this.prestamoRepository = prestamoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public LoanResponse createLoan(LoanRequest request, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        Prestamo prestamo = Prestamo.builder()
                .monto(request.getMonto())
                .plazo(request.getPlazo())
                .fechaSolicitud(LocalDateTime.now())
                .estado(EstadoPrestamo.PENDIENTE)
                .usuario(usuario)
                .build();

        return LoanResponse.from(prestamoRepository.save(prestamo));
    }

    public List<LoanResponse> getMyLoans(String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return prestamoRepository.findByUsuario(usuario)
                .stream()
                .map(LoanResponse::from)
                .toList();
    }

    public List<LoanResponse> getAllLoans() {
        return prestamoRepository.findAll()
                .stream()
                .map(LoanResponse::from)
                .toList();
    }

    public LoanResponse approveLoan(Long id) {
        Prestamo prestamo = prestamoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Préstamo no encontrado con id: " + id));
        prestamo.setEstado(EstadoPrestamo.APROBADO);
        return LoanResponse.from(prestamoRepository.save(prestamo));
    }

    public LoanResponse rejectLoan(Long id) {
        Prestamo prestamo = prestamoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Préstamo no encontrado con id: " + id));
        prestamo.setEstado(EstadoPrestamo.RECHAZADO);
        return LoanResponse.from(prestamoRepository.save(prestamo));
    }
}
