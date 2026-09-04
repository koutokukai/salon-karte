"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  hashPassword,
  requireTenant,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCustomer, updateCustomer } from "@/lib/services/customers";
import { createKarte } from "@/lib/services/kartes";
import { postChat } from "@/lib/services/chats";
import {
  assertNoSalonTypeChange,
  chatSchema,
  customerSchema,
  karteSchema,
  loginSchema,
  tenantCreateSchema,
} from "@/lib/validation";

export type ActionState = { error?: string };

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "入力内容を確認してください";
}

export async function signupAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = tenantCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { tenantName, salonType, email, password } = parsed.data;
  if (await prisma.tenant.findUnique({ where: { email } })) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  // salon_type を設定できるのはこの1箇所だけ
  const tenant = await prisma.tenant.create({
    data: { tenantName, salonType, email, passwordHash: await hashPassword(password) },
  });

  await createSession(tenant.tenantId);
  redirect("/dashboard");
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const tenant = await prisma.tenant.findUnique({ where: { email: parsed.data.email } });
  if (!tenant || !(await verifyPassword(parsed.data.password, tenant.passwordHash))) {
    return { error: "メールアドレスまたはパスワードが違います" };
  }

  await createSession(tenant.tenantId);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function saveCustomerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const raw = Object.fromEntries(formData);
  assertNoSalonTypeChange(raw);

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const customerId = typeof raw.customerId === "string" ? raw.customerId : "";
  const customer = customerId
    ? await updateCustomer(tenant.tenantId, customerId, parsed.data)
    : await createCustomer(tenant.tenantId, parsed.data);

  revalidatePath("/customers");
  redirect(`/customers/${customer!.customerId}`);
}

export async function saveKarteAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = karteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const karte = await createKarte(tenant.tenantId, parsed.data);

  revalidatePath(`/customers/${karte.customerId}`);
  redirect(`/customers/${karte.customerId}`);
}

export async function sendChatAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await requireTenant();
  const parsed = chatSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { customerId, messageFrom, messageBody } = parsed.data;
  await postChat(tenant.tenantId, customerId, messageFrom, messageBody);

  revalidatePath(`/customers/${customerId}`);
  return {};
}
