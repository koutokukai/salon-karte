import "server-only";
import { prisma } from "@/lib/db";

/** チャット（問い合わせ）サービス層。 */

export function listChats(tenantId: string, customerId: string) {
  return prisma.chat.findMany({
    where: { tenantId, customerId },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
}

export async function postChat(
  tenantId: string,
  customerId: string,
  messageFrom: "tenant" | "customer",
  messageBody: string,
) {
  const customer = await prisma.customer.findFirst({
    where: { tenantId, customerId },
    select: { customerId: true },
  });
  if (!customer) throw new Error("顧客が見つかりません");

  return prisma.chat.create({
    data: { tenantId, customerId, messageFrom, messageBody },
  });
}
