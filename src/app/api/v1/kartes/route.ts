import { NextResponse, type NextRequest } from "next/server";
import { withTenant } from "@/lib/api";
import { createKarte, listKartesByCustomer } from "@/lib/services/kartes";
import { karteSchema } from "@/lib/validation";

export function GET(request: NextRequest) {
  return withTenant(async (tenant) => {
    const customerId = request.nextUrl.searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ error: "customerId は必須です" }, { status: 422 });
    }
    return NextResponse.json({ kartes: await listKartesByCustomer(tenant.tenantId, customerId) });
  });
}

export function POST(request: NextRequest) {
  return withTenant(async (tenant) => {
    const parsed = karteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
    }
    const karte = await createKarte(tenant.tenantId, parsed.data);
    return NextResponse.json({ karte }, { status: 201 });
  });
}
