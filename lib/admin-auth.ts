import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "m3d_admin";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "change-me-123";
}

function secret(): string {
  return process.env.ADMIN_SECRET || "m3dstore-local-secret";
}

export function sessionToken(): string {
  return crypto.createHmac("sha256", secret()).update(adminPassword()).digest("hex");
}

export function verifyPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token === sessionToken();
}

export { COOKIE_NAME };
