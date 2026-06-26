# JRPrestamos — Sistema de Gestión de Préstamos

Aplicación full-stack de gestión de préstamos desarrollada como prueba técnica.

---

## Arquitectura

```
JRPrestamos/
├── backend/          ← Spring Boot (Java 19, Maven)
├── artifacts/
│   └── loan-app/     ← React + Vite (frontend)
└── lib/
    └── api-spec/     ← OpenAPI spec (fuente de verdad del contrato)
```

### Backend — Arquitectura por capas

```
backend/src/main/java/com/jrprestamos/backend/
├── config/           ← SecurityConfig, DataInitializer (CORS, JWT, datos iniciales)
├── controller/       ← AuthController, LoanController, AdminController
├── dto/              ← LoginRequest/Response, LoanRequest/Response, ErrorResponse
├── entity/           ← Usuario, Prestamo, EstadoPrestamo (enum)
├── exception/        ← GlobalExceptionHandler (@RestControllerAdvice), ResourceNotFoundException
├── repository/       ← UsuarioRepository, PrestamoRepository (Spring Data JPA)
├── security/         ← JwtUtil, JwtFilter (OncePerRequestFilter), UserDetailsServiceImpl
└── service/          ← AuthService, LoanService
```

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 19, Spring Boot 3.2, Maven |
| Persistencia | Spring Data JPA + H2 (in-memory) |
| Seguridad | Spring Security + JWT (jjwt 0.12) |
| Validación | Hibernate Validator |
| Frontend | React 18, Vite, TanStack Query |
| Estilos | Tailwind CSS + shadcn/ui |
| Routing | wouter |
| API client | Orval (codegen desde OpenAPI) |

---

## Cómo ejecutar

### Backend

```bash
cd backend
mvn spring-boot:run
```

El servidor inicia en `http://localhost:8080`. El context-path es `/api`, por lo que todos los endpoints son accesibles en `http://localhost:8080/api/...`.

**Consola H2:** `http://localhost:8080/api/h2-console`  
JDBC URL: `jdbc:h2:mem:prestamosdb` | User: `sa` | Password: *(vacío)*

### Frontend

```bash
pnpm --filter @workspace/loan-app run dev
```

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@test.com` | `123` |
| Usuario | `usuario@test.com` | `123` |

Los datos se inicializan automáticamente al arrancar el backend (via `DataInitializer`). Incluye 3 préstamos de ejemplo (PENDIENTE, APROBADO, RECHAZADO).

---

## Endpoints principales

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Autenticación, devuelve JWT |
| POST | `/api/loans` | ROLE_USER | Solicitar un préstamo |
| GET | `/api/loans/my` | ROLE_USER | Mis préstamos |
| GET | `/api/admin/loans` | ROLE_ADMIN | Todos los préstamos |
| PUT | `/api/admin/loans/{id}/approve` | ROLE_ADMIN | Aprobar préstamo |
| PUT | `/api/admin/loans/{id}/reject` | ROLE_ADMIN | Rechazar préstamo |

### Ejemplo de login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@test.com","password":"123"}'
```

Respuesta:
```json
{
  "token": "eyJ...",
  "role": "ROLE_USER",
  "email": "usuario@test.com"
}
```

---

## Seguridad

- JWT firmado con HS256, expiración 8 horas
- Contraseñas hasheadas con BCrypt
- Endpoints de admin protegidos por `hasAuthority("ROLE_ADMIN")`
- CORS configurado para aceptar cualquier origen (apropiado para prueba técnica)
- Sesiones stateless (sin HttpSession)

---

## Decisiones de diseño

- **H2 in-memory:** Acorde al enunciado. Los datos se reinician al apagar el servidor.
- **`plazo` opcional:** El frontend no expone el campo plazo en el formulario (decisión de UX); el backend lo acepta pero no lo requiere.
- **Sin arquitectura hexagonal:** El enunciado pide una solución limpia dentro del tiempo de una prueba técnica (~3h). Se usa una arquitectura por capas estándar (Controller → Service → Repository).
- **DataInitializer vs data.sql:** Se usa `ApplicationRunner` en lugar de `data.sql` para garantizar que BCrypt codifique las contraseñas correctamente en tiempo de ejecución.
