import { Router } from "express";
import { findUserByEmail } from "../lib/store.js";
import { signToken } from "../lib/auth.js";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error",
      errors: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  const token = signToken({ sub: user.email, role: user.role });

  res.json({ token, role: user.role, email: user.email });
});

export default router;
