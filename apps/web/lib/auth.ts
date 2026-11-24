import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import crypto from "crypto";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JWTPayload = { id: string; role: string; email: string; sessionId?: string };

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

// Create a session in DB
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return token;
}

// Validate session
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

// Delete session (logout)
export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export const COOKIE_NAME = "auth_token";