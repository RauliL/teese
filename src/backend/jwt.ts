import { SignJWT, jwtVerify } from "jose";
import type { AuthTokenPayload } from "../types.js";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "teese-dev-secret-change-in-production",
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

export async function signAuthToken(
  payload: AuthTokenPayload,
): Promise<string> {
  return new SignJWT({ isAdmin: payload.isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  const username = payload.sub;

  if (typeof username !== "string") {
    throw new Error("Invalid token subject.");
  }

  return {
    sub: username,
    isAdmin: payload.isAdmin === true,
  };
}
