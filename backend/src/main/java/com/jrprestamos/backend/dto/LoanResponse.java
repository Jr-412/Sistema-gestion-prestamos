package com.jrprestamos.backend.dto;

import com.jrprestamos.backend.entity.EstadoPrestamo;
import com.jrprestamos.backend.entity.Prestamo;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoanResponse {
    private Long id;
    private Double monto;
    private Integer plazo;
    private LocalDateTime fechaSolicitud;
    private EstadoPrestamo estado;
    private String userEmail;

    public static LoanResponse from(Prestamo prestamo) {
        LoanResponse dto = new LoanResponse();
        dto.setId(prestamo.getId());
        dto.setMonto(prestamo.getMonto());
        dto.setPlazo(prestamo.getPlazo());
        dto.setFechaSolicitud(prestamo.getFechaSolicitud());
        dto.setEstado(prestamo.getEstado());
        dto.setUserEmail(prestamo.getUsuario().getEmail());
        return dto;
    }
}
