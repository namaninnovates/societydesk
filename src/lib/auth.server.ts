import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env["JWT_SECRET"] || "societydesk_jwt_super_secret_key_2026_production_safe_token";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return await bcrypt.compare(password, hash);
  }
  // Backward compatibility fallback for test seeds
  try {
    const crypto = await import("crypto");
    const salt = "societydesk_auth_salt_2026";
    const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return calculated === hash;
  } catch {
    return false;
  }
}

export type TokenPayload = {
  id: string;
  email: string;
  role: "admin" | "staff" | "resident";
};

export async function createJwtToken(user: TokenPayload): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyJwtToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || !payload["email"] || !payload["role"]) return null;
    return {
      id: payload.sub,
      email: String(payload["email"]),
      role: payload["role"] as "admin" | "staff" | "resident",
    };
  } catch {
    return null;
  }
}
