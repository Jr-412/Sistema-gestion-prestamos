import type { Role } from "./auth.js";

export interface User {
  email: string;
  password: string;
  role: Role;
}

export type LoanStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

export interface Loan {
  id: number;
  monto: number;
  plazo: number;
  fechaSolicitud: string; // ISO date string
  estado: LoanStatus;
  userEmail: string;
}

// Pre-seeded users (equivalent to H2 data.sql)
export const users: User[] = [
  { email: "admin@test.com", password: "123", role: "ROLE_ADMIN" },
  { email: "usuario@test.com", password: "123", role: "ROLE_USER" },
];

// In-memory loan store (equivalent to H2 in-memory database)
let nextId = 1;
export const loans: Loan[] = [];

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function createLoan(
  userEmail: string,
  monto: number,
  plazo: number,
): Loan {
  const loan: Loan = {
    id: nextId++,
    monto,
    plazo,
    fechaSolicitud: new Date().toISOString(),
    estado: "PENDIENTE",
    userEmail,
  };
  loans.push(loan);
  return loan;
}

export function getLoanById(id: number): Loan | undefined {
  return loans.find((l) => l.id === id);
}

export function updateLoanStatus(id: number, estado: LoanStatus): Loan | null {
  const loan = getLoanById(id);
  if (!loan) return null;
  loan.estado = estado;
  return loan;
}
