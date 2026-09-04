import { NextResponse, type NextRequest } from "next/server";
import { withTenant } from "@/lib/api";
import { createCustomer, listCustomers } from "@/lib/services/customers";
import { customerSchema } from "@/lib/validation";

export function GET(request: NextRequest) {
  return withTenant(async (tenant) => {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    return NextResponse.json({ customers: await listCustomers(tenant.tenantId, q) });
  });
}

export function POST(request: NextRequest) {
  return withTenant(async (tenant) => {
    const parsed = customerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
    }
    const customer = await createCustomer(tenant.tenantId, parsed.data);
    return NextResponse.json({ customer }, { status: 201 });
  });
}
