import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import { CustomerForm } from "@/components/CustomerForm";
import { getCustomer, parseList } from "@/lib/services/customers";
import { toDateInputValue } from "@/lib/format";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const tenant = await requireTenant();
  const { customerId } = await params;

  const customer = await getCustomer(tenant.tenantId, customerId);
  if (!customer) notFound();

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href={`/customers/${customerId}`} className="text-sm text-gray-500">
        ‹ 戻る
      </Link>
      <h1 className="text-xl font-bold">顧客情報の編集</h1>
      <CustomerForm
        defaults={{
          customerId: customer.customerId,
          customerName: customer.customerName,
          phone: customer.phone,
          email: customer.email,
          birthday: customer.birthday ? toDateInputValue(customer.birthday) : "",
          familyInfo: customer.familyInfo,
          petInfo: customer.petInfo,
          favoriteMovies: parseList(customer.favoriteMovies).join(", "),
          favoriteDramas: parseList(customer.favoriteDramas).join(", "),
          favoriteFoods: parseList(customer.favoriteFoods).join(", "),
          memo: customer.memo,
        }}
      />
    </main>
  );
}
