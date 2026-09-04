import "server-only";
import { prisma } from "@/lib/db";
import { isSalonType, SALON_TYPES, type SalonType } from "@/lib/salon";
import type { KarteInput } from "@/lib/validation";

/** カルテサービス層。全業種を1テーブルで扱う（業種別テーブルには分割しない）。 */

/**
 * 自店の業種に属さないカラムを落とす。
 * 1テーブル設計なので、API を直接叩けば他業種のカラムにも書けてしまう。
 * 「該当しない業種のカラムは NULL のまま」という仕様を保つための防壁。
 */
function stripForeignSalonFields(salonType: SalonType, input: KarteInput): KarteInput {
  const foreignPrefixes = SALON_TYPES.filter((type) => type !== salonType);
  const cleaned = { ...input } as Record<string, unknown>;

  for (const key of Object.keys(cleaned)) {
    if (foreignPrefixes.some((prefix) => key.startsWith(prefix))) delete cleaned[key];
  }
  return cleaned as KarteInput;
}

function toRow(input: KarteInput) {
  const { customerId, visitDate, ...rest } = input;
  return {
    ...rest,
    staffName: rest.staffName ?? null,
    visitDate: new Date(visitDate),
  };
}

export function listKartesByCustomer(tenantId: string, customerId: string) {
  return prisma.karte.findMany({
    where: { tenantId, customerId },
    orderBy: { visitDate: "desc" },
  });
}

export function getKarte(tenantId: string, karteId: string) {
  return prisma.karte.findFirst({ where: { tenantId, karteId } });
}

/** 直近のカルテ。【リチャード提案】「前回をコピーして新規カルテ」の初期値に使う。 */
export function latestKarte(tenantId: string, customerId: string) {
  return prisma.karte.findFirst({
    where: { tenantId, customerId },
    orderBy: { visitDate: "desc" },
  });
}

export async function createKarte(tenantId: string, input: KarteInput) {
  // 顧客が同一テナントに属することを確認してから作成する
  const [customer, tenant] = await Promise.all([
    prisma.customer.findFirst({
      where: { tenantId, customerId: input.customerId },
      select: { customerId: true },
    }),
    prisma.tenant.findUnique({ where: { tenantId }, select: { salonType: true } }),
  ]);
  if (!customer) throw new Error("顧客が見つかりません");
  if (!tenant || !isSalonType(tenant.salonType)) throw new Error("店舗が見つかりません");

  return prisma.karte.create({
    data: {
      tenantId,
      customerId: customer.customerId,
      ...toRow(stripForeignSalonFields(tenant.salonType, input)),
    },
  });
}

export async function updateKarte(tenantId: string, karteId: string, input: KarteInput) {
  const tenant = await prisma.tenant.findUnique({ where: { tenantId }, select: { salonType: true } });
  if (!tenant || !isSalonType(tenant.salonType)) throw new Error("店舗が見つかりません");

  const result = await prisma.karte.updateMany({
    where: { tenantId, karteId },
    data: toRow(stripForeignSalonFields(tenant.salonType, input)),
  });
  if (result.count === 0) throw new Error("カルテが見つかりません");
  return getKarte(tenantId, karteId);
}

export async function dashboardStats(tenantId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [customerCount, karteCountThisMonth] = await Promise.all([
    prisma.customer.count({ where: { tenantId } }),
    prisma.karte.count({ where: { tenantId, visitDate: { gte: monthStart } } }),
  ]);
  return { customerCount, karteCountThisMonth };
}
