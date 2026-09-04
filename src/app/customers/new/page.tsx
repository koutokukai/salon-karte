import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { CustomerForm } from "@/components/CustomerForm";

export default async function NewCustomerPage() {
  await requireTenant();

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/customers" className="text-sm text-gray-500">
        ‹ 顧客一覧
      </Link>
      <h1 className="text-xl font-bold">新規顧客</h1>
      <CustomerForm />
    </main>
  );
}
