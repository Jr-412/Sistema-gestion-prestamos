import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import {
  loans,
  createLoan,
  getLoanById,
  updateLoanStatus,
} from "../lib/store.js";
import {
  RequestLoanBody,
  ApproveLoanParams,
  RejectLoanParams,
} from "@workspace/api-zod";

const router = Router();

// GET /loans — Admin: all loans
router.get("/loans", requireAuth, requireRole("ROLE_ADMIN"), (_req, res) => {
  res.json(loans);
});

// GET /loans/my — User: own loans
router.get("/loans/my", requireAuth, requireRole("ROLE_USER"), (req, res) => {
  const userEmail = req.user!.sub;
  res.json(loans.filter((l) => l.userEmail === userEmail));
});

// POST /loans — User: request a loan
router.post("/loans", requireAuth, requireRole("ROLE_USER"), (req, res) => {
  const parsed = RequestLoanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error",
      errors: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const { monto, plazo } = parsed.data;

  if (monto <= 0) {
    res.status(400).json({ message: "El monto debe ser positivo" });
    return;
  }
  if (plazo <= 0) {
    res.status(400).json({ message: "El plazo debe ser positivo" });
    return;
  }

  const loan = createLoan(req.user!.sub, monto, plazo);
  res.status(201).json(loan);
});

// PUT /loans/:id/approve — Admin: approve a loan
router.put(
  "/loans/:id/approve",
  requireAuth,
  requireRole("ROLE_ADMIN"),
  (req, res) => {
    const parsed = ApproveLoanParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid loan ID" });
      return;
    }

    const loan = getLoanById(parsed.data.id);
    if (!loan) {
      res.status(404).json({ message: "Préstamo no encontrado" });
      return;
    }

    const updated = updateLoanStatus(parsed.data.id, "APROBADO");
    res.json(updated);
  },
);

// PUT /loans/:id/reject — Admin: reject a loan
router.put(
  "/loans/:id/reject",
  requireAuth,
  requireRole("ROLE_ADMIN"),
  (req, res) => {
    const parsed = RejectLoanParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid loan ID" });
      return;
    }

    const loan = getLoanById(parsed.data.id);
    if (!loan) {
      res.status(404).json({ message: "Préstamo no encontrado" });
      return;
    }

    const updated = updateLoanStatus(parsed.data.id, "RECHAZADO");
    res.json(updated);
  },
);

export default router;
