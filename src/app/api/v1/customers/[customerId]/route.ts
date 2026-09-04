import { NextResponse, type NextRequest } from "next/server";
import { withTenant } from "@/lib/api";
import { getCustomer, updateCustomer } from "@/lib/services/customers";
import { assertNoSalonTypeChange, customerSchema } from "@/lib/validation";

type Params = { params: Promise<{ customerId: string }> };

export function GET(_request: NextRequest, { params }: Params) {
  return withTenant(async (tenant) => {
    const { customerId } = await params;
    const customer = await getCustomer(tenant.tenantId, customerId);
    if (!customer) return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
    return NextResponse.json({ customer });
  });
}

export function PATCH(request: NextRequest, { params }: Params) {
  return withTenant(async (tenant) => {
    const { customerId } = await params;
    const body: unknown = await request.json();
    assertNoSalonTypeChange((body ?? {}) as Record<string, unknown>);

    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
    }
    return NextResponse.json({ customer: await updateCustomer(tenant.tenantId, customerId, parsed.data) });
  });
}
