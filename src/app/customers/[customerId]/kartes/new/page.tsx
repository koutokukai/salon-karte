import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import { KarteForm } from "@/components/karte/KarteForm";
import { saveKarteAction } from "@/lib/actions";
import { getCustomer } from "@/lib/services/customers";
import { latestKarte } from "@/lib/services/kartes";
import { SALON_META } from "@/lib/salon";
import { toDateInputValue } from "@/lib/format";
import type { KarteDefaults } from "@/components/karte/types";

export default async function NewKartePage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ copy?: string }>;
}) {
  const tenant = await requireTenant();
  const { customerId } = await params;
  const { copy } = await searchParams;

  const customer = await getCustomer(tenant.tenantId, customerId);
  if (!customer) notFound();

  // 【リチャード提案・採用】前回カルテをコピーして初期値にする
  const previous = copy === "1" ? await latestKarte(tenant.tenantId, customerId) : null;

  const defaults: KarteDefaults = {
    ...(previous ?? {}),
    visitDate: toDateInputValue(new Date()),
    price: previous?.price ?? "",
    nextVisitGuide: previous?.nextVisitGuide ?? SALON_META[tenant.salonType].defaultVisitCycleDays,
    // 写真は前回分を引き継がない（別の施術の写真が残ると事故になる）
    photoBefore: "",
    photoAfter: "",
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href={`/customers/${customerId}`} className="text-sm text-gray-500">
        ‹ {customer.customerName}
      </Link>
      <h1 className="text-xl font-bold">
        新規カルテ
        {previous ? <span className="ml-2 text-sm font-normal text-gray-500">前回をコピー</span> : null}
      </h1>
      <KarteForm
        salonType={tenant.salonType}
        customerId={customerId}
        defaults={defaults}
        action={saveKarteAction}
      />
    </main>
  );
}
