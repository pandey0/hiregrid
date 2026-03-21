import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateShortToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function tokenExpiresAt(hours: number = 72): Date {
  const exp = new Date();
  exp.setHours(exp.getHours() + hours);
  return exp;
}
