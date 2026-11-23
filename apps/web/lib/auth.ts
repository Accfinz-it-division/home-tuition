import { SignJWT, jwtVerify } from "jose";

// Secret key used to sign and verify JWTs
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JWTPayload = { id: string; role: string; email: string };

// Generate a signed JWT token valid for 7 days
export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify JWT token and return payload, or null if invalid
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Cookie name used to store the JWT
export const COOKIE_NAME = "auth_token";