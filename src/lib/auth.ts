import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isSalonType, type SalonType } from "@/lib/salon";
import { env } from "@/lib/env";

const COOKIE_NAME = "sk_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function secret() {
  const value = env("AUTH_SECRET");
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET が未設定、または短すぎます（16文字以上）");
  }
  return new TextEncoder().encode(value);
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(tenantId: string) {
  const token = await new SignJWT({ tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export type SessionTenant = {
  tenantId: string;
  tenantName: string;
  salonType: SalonType;
  email: string;
};

/** ログイン中の店舗を返す。未ログインなら null。 */
export const getTenant = cache(async (): Promise<SessionTenant | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  let tenantId: string;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.tenantId !== "string") return null;
    tenantId = payload.tenantId;
  } catch {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({ where: { tenantId } });
  if (!tenant || !isSalonType(tenant.salonType)) return null;

  return {
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
    salonType: tenant.salonType,
    email: tenant.email,
  };
});

/** ログイン必須ページ用。未ログインなら /login へ飛ばす。 */
export async function requireTenant(): Promise<SessionTenant> {
  const tenant = await getTenant();
  if (!tenant) redirect("/login");
  return tenant;
}
