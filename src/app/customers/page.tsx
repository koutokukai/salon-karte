import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui";
import { listCustomers } from "@/lib/services/customers";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const tenant = await requireTenant();
  const { q } = await searchParams;
  const customers = await listCustomers(tenant.tenantId, q);

  return (
    <>
      <AppHeader tenant={tenant} />
      <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
        <form className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="顧客名で検索"
            className="tap w-full rounded-lg border border-gray-300 bg-white px-3 text-base"
          />
          <button type="submit" className="tap shrink-0 rounded-lg border border-gray-300 px-4 font-medium">
            検索
          </button>
        </form>

        {customers.length === 0 ? (
          <Card className="text-sm text-gray-500">該当する顧客がいません。</Card>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {customers.map((customer) => (
              <li key={customer.customerId}>
                <Link
                  href={`/customers/${customer.customerId}`}
                  className="flex items-center justify-between gap-3 px-4 py-4"
                >
                  <span className="truncate text-lg font-bold">{customer.customerName}</span>
                  <span className="shrink-0 text-sm text-gray-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Link
            href="/dashboard"
            className="tap-primary flex flex-1 items-center justify-center rounded-xl border border-gray-300 font-bold"
          >
            ホーム
          </Link>
          <Link
            href="/customers/new"
            className="tap-primary flex flex-1 items-center justify-center rounded-xl bg-[var(--salon-main)] font-bold text-white"
          >
            ＋新規顧客
          </Link>
        </div>
      </nav>
    </>
  );
}
