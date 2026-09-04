import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { SALON_META } from "@/lib/salon";
import type { SessionTenant } from "@/lib/auth";

/** 【サレオツ】ヘッダーは業種テーマ色の細帯のみ。情報量を増やさない。 */
export function AppHeader({ tenant }: { tenant: SessionTenant }) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="h-1 bg-[var(--salon-main)]" />
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="min-w-0">
          <span className="block truncate text-base font-bold">{tenant.tenantName}</span>
          <span className="block text-xs text-gray-500">{SALON_META[tenant.salonType].label}</span>
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg px-3 py-2 text-sm text-gray-500 underline">
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
