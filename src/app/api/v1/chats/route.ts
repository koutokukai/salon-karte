import { NextResponse, type NextRequest } from "next/server";
import { withTenant } from "@/lib/api";
import { listChats, postChat } from "@/lib/services/chats";
import { chatSchema } from "@/lib/validation";

export function GET(request: NextRequest) {
  return withTenant(async (tenant) => {
    const customerId = request.nextUrl.searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ error: "customerId は必須です" }, { status: 422 });
    }
    return NextResponse.json({ chats: await listChats(tenant.tenantId, customerId) });
  });
}

export function POST(request: NextRequest) {
  return withTenant(async (tenant) => {
    const parsed = chatSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
    }
    const { customerId, messageFrom, messageBody } = parsed.data;
    const chat = await postChat(tenant.tenantId, customerId, messageFrom, messageBody);
    return NextResponse.json({ chat }, { status: 201 });
  });
}
