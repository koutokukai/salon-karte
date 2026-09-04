import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui";
import { dashboardStats } from "@/lib/services/kartes";
import { recentVisitors } from "@/lib/services/customers";
import { formatDate, relativeDays } from "@/lib/format";

export default async function DashboardPage() {
  const tenant = await requireTenant();
  const [stats, recent] = await Promise.all([
    dashboardStats(tenant.tenantId),
    recentVisitors(tenant.tenantId),
  ]);

  return (
    <>
      <AppHeader tenant={tenant} />
      <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-gray-500">顧客数</p>
            <p className="text-3xl font-bold">{stats.customerCount}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">今月のカルテ</p>
            <p className="text-3xl font-bold">{stats.karteCountThisMonth}</p>
          </Card>
        </div>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-600">最近来店した顧客</h2>
          {recent.length === 0 ? (
            <Card className="text-sm text-gray-500">
              まだカルテがありません。顧客を登録してカルテを作成してください。
            </Card>
          ) : (
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
              {recent.map((row) => (
                <li key={row.customer.customerId}>
                  <Link
                    href={`/customers/${row.customer.customerId}`}
                    className="flex items-center justify-between gap-3 px-4 py-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-bold">
                        {row.customer.customerName}
                      </span>
                      {row.allergy ? (
                        <span className="block text-xs font-bold text-[var(--danger)]">
                          ⚠ アレルギー・禁忌あり
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm text-gray-500">
                      {relativeDays(row.lastVisit)}
                      <span className="ml-2 text-xs">{formatDate(row.lastVisit)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* 【サレオツ】主要導線は下部固定。右側が主アクション。 */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Link
            href="/customers"
            className="tap-primary flex flex-1 items-center justify-center rounded-xl border border-gray-300 font-bold"
          >
            顧客一覧
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
