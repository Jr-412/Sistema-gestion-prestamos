package com.jrprestamos.backend.controller;

import com.jrprestamos.backend.dto.LoanRequest;
import com.jrprestamos.backend.dto.LoanResponse;
import com.jrprestamos.backend.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<LoanResponse> requestLoan(@Valid @RequestBody LoanRequest request,
                                                     Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(loanService.createLoan(request, email));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LoanResponse>> getMyLoans(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(loanService.getMyLoans(email));
    }
}
