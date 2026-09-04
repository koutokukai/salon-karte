import "server-only";
import { prisma } from "@/lib/db";
import type { CustomerInput } from "@/lib/validation";

/**
 * 顧客サービス層。
 * Web(Server Actions) と /api/v1(将来のネイティブアプリ) の双方から呼ぶ共通ロジック。
 * ⚠ 全関数が tenantId を必須引数に取る。テナント跨ぎの参照を型で防ぐ。
 */

function toRow(input: CustomerInput) {
  return {
    customerName: input.customerName,
    phone: input.phone ?? null,
    email: input.email ?? null,
    birthday: input.birthday ? new Date(input.birthday) : null,
    familyInfo: input.familyInfo ?? null,
    petInfo: input.petInfo ?? null,
    favoriteMovies: JSON.stringify(input.favoriteMovies),
    favoriteDramas: JSON.stringify(input.favoriteDramas),
    favoriteFoods: JSON.stringify(input.favoriteFoods),
    memo: input.memo ?? null,
  };
}

export function parseList(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function listCustomers(tenantId: string, query?: string) {
  const q = query?.trim();
  return prisma.customer.findMany({
    where: {
      tenantId,
      ...(q ? { customerName: { contains: q } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}

export function getCustomer(tenantId: string, customerId: string) {
  return prisma.customer.findFirst({ where: { tenantId, customerId } });
}

export function createCustomer(tenantId: string, input: CustomerInput) {
  return prisma.customer.create({ data: { tenantId, ...toRow(input) } });
}

export async function updateCustomer(tenantId: string, customerId: string, input: CustomerInput) {
  const result = await prisma.customer.updateMany({
    where: { tenantId, customerId },
    data: toRow(input),
  });
  if (result.count === 0) throw new Error("顧客が見つかりません");
  return getCustomer(tenantId, customerId);
}

/** 最近来店した顧客（ダッシュボード用） */
export async function recentVisitors(tenantId: string, limit = 8) {
  const kartes = await prisma.karte.findMany({
    where: { tenantId },
    orderBy: { visitDate: "desc" },
    take: limit * 3,
    include: { customer: true },
  });

  const seen = new Set<string>();
  const rows = [];
  for (const karte of kartes) {
    if (seen.has(karte.customerId)) continue;
    seen.add(karte.customerId);
    rows.push({ customer: karte.customer, lastVisit: karte.visitDate, allergy: karte.allergyFlag });
    if (rows.length >= limit) break;
  }
  return rows;
}
