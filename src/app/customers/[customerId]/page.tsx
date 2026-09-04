import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { AlertBar, Card } from "@/components/ui";
import { Tabs } from "@/components/Tabs";
import { ChatPanel } from "@/components/ChatPanel";
import { KarteHistory } from "@/components/KarteHistory";
import { getCustomer, parseList } from "@/lib/services/customers";
import { listKartesByCustomer } from "@/lib/services/kartes";
import { listChats } from "@/lib/services/chats";
import { formatDate } from "@/lib/format";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const tenant = await requireTenant();
  const { customerId } = await params;

  const customer = await getCustomer(tenant.tenantId, customerId);
  if (!customer) notFound();

  const [kartes, chats] = await Promise.all([
    listKartesByCustomer(tenant.tenantId, customerId),
    listChats(tenant.tenantId, customerId),
  ]);

  const alerts = [
    ...kartes.filter((k) => k.allergyFlag).map((k) => k.allergyNote ?? "アレルギー・禁忌あり"),
    ...kartes.map((k) => k.relaxContraindication).filter((v): v is string => Boolean(v)),
  ];
  const uniqueAlerts = [...new Set(alerts)];

  const favorites = [
    ...parseList(customer.favoriteDramas),
    ...parseList(customer.favoriteMovies),
    ...parseList(customer.favoriteFoods),
  ];

  return (
    <>
      <AppHeader tenant={tenant} />
      <main className="mx-auto max-w-2xl space-y-4 p-4 pb-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/customers" className="text-sm text-gray-500">
            ‹ 顧客一覧
          </Link>
          <Link href={`/customers/${customerId}/edit`} className="text-sm text-[var(--salon-main)] underline">
            編集
          </Link>
        </div>

        <h1 className="text-2xl font-bold">{customer.customerName}</h1>

        {/* 危険情報は最上部・赤帯。色だけに頼らず ⚠ とテキストを併記する。 */}
        {uniqueAlerts.length > 0 ? <AlertBar>{uniqueAlerts.join(" / ")}</AlertBar> : null}

        {/* 【差別化の核】嗜好メモは折りたたまない。開いた瞬間に見えることに価値がある。 */}
        <Card className="space-y-1 bg-[var(--salon-soft)] text-sm">
          <p>
            {customer.birthday ? `誕生日 ${formatDate(customer.birthday)}` : "誕生日 未登録"}
            {customer.petInfo ? ` ／ ${customer.petInfo}` : ""}
            {customer.familyInfo ? ` ／ ${customer.familyInfo}` : ""}
          </p>
          {favorites.length > 0 ? <p>好き：{favorites.join(" / ")}</p> : null}
        </Card>

        <Tabs
          tabs={[
            {
              key: "kartes",
              label: "カルテ履歴",
              content: (
                <KarteHistory kartes={kartes} salonType={tenant.salonType} customerId={customerId} />
              ),
            },
            {
              key: "profile",
              label: "プロフィール",
              content: (
                <Card className="space-y-2 text-sm">
                  <Row label="電話番号" value={customer.phone} />
                  <Row label="メール" value={customer.email} />
                  <Row label="家族構成" value={customer.familyInfo} />
                  <Row label="ペット" value={customer.petInfo} />
                  <Row label="好きなドラマ" value={parseList(customer.favoriteDramas).join(" / ")} />
                  <Row label="好きな映画" value={parseList(customer.favoriteMovies).join(" / ")} />
                  <Row label="好きな食べ物" value={parseList(customer.favoriteFoods).join(" / ")} />
                  <Row label="特記事項" value={customer.memo} />
                </Card>
              ),
            },
            {
              key: "chat",
              label: "チャット",
              content: (
                <ChatPanel
                  customerId={customerId}
                  messages={chats.map((chat) => ({
                    chatId: chat.chatId,
                    messageFrom: chat.messageFrom,
                    messageBody: chat.messageBody,
                    createdAt: formatDate(chat.createdAt),
                  }))}
                />
              ),
            },
          ]}
        />
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 break-words whitespace-pre-wrap">{value}</span>
    </div>
  );
}
