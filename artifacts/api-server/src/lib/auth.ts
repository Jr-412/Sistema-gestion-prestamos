import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required but was not provided. " +
      "Set it in your environment secrets before starting the server.",
  );
}

const JWT_EXPIRES_IN = "8h";

export type Role = "ROLE_ADMIN" | "ROLE_USER";

export interface JwtPayload {
  sub: string; // user email
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET as string) as Record<
    string,
    unknown
  >;

  // Validate expected claims shape
  if (
    typeof decoded.sub !== "string" ||
    (decoded.role !== "ROLE_ADMIN" && decoded.role !== "ROLE_USER")
  ) {
    throw new Error("Invalid token claims");
  }

  return { sub: decoded.sub, role: decoded.role as Role };
}
