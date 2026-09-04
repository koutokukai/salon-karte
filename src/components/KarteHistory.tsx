import Link from "next/link";
import type { Karte } from "@/generated/prisma/client";
import type { SalonType } from "@/lib/salon";
import { formatDate } from "@/lib/format";

/** 業種ごとにカルテ一覧へ出す要約項目。DBは1テーブルのまま、表示だけ切り替える。 */
const SUMMARY: Record<SalonType, { label: string; key: keyof Karte }[]> = {
  nail: [
    { label: "カラー配合", key: "nailColorFormula" },
    { label: "形", key: "nailShape" },
    { label: "長さ", key: "nailLength" },
  ],
  eyelash: [
    { label: "カール", key: "eyelashCurlType" },
    { label: "本数", key: "eyelashCount" },
    { label: "太さ", key: "eyelashThickness" },
    { label: "グルー", key: "eyelashGlueType" },
  ],
  hair: [
    { label: "カラー配合", key: "hairColorFormula" },
    { label: "カット", key: "hairCutLength" },
    { label: "パーマ", key: "hairPermType" },
  ],
  relax: [
    { label: "圧", key: "relaxPressureLevel" },
    { label: "主訴", key: "relaxSymptom" },
    { label: "箇所", key: "relaxTargetArea" },
  ],
};

export function KarteHistory({
  kartes,
  salonType,
  customerId,
}: {
  kartes: Karte[];
  salonType: SalonType;
  customerId: string;
}) {
  if (kartes.length === 0) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          まだカルテがありません。
        </p>
        <NewKarteLink customerId={customerId} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {kartes.map((karte) => (
        <article key={karte.karteId} className="rounded-xl border border-gray-200 bg-white p-4">
          <header className="flex items-baseline justify-between gap-2">
            <h3 className="font-bold">{formatDate(karte.visitDate)}</h3>
            <span className="text-xs text-gray-500">
              {[
                karte.staffName ? `担当:${karte.staffName}` : null,
                karte.price != null ? `¥${karte.price.toLocaleString()}` : null,
              ]
                .filter(Boolean)
                .join(" / ")}
            </span>
          </header>

          {karte.menuName ? <p className="mt-1 text-sm">{karte.menuName}</p> : null}

          <dl className="mt-2 space-y-1 text-sm">
            {SUMMARY[salonType].map(({ label, key }) => {
              const value = karte[key];
              if (value === null || value === undefined || value === "") return null;
              return (
                <div key={label} className="flex gap-2">
                  <dt className="shrink-0 text-gray-500">{label}</dt>
                  <dd className="min-w-0 break-words">{String(value)}</dd>
                </div>
              );
            })}
          </dl>

          {(karte.photoBefore ?? karte.photoAfter) ? (
            <div className="mt-3 flex gap-2">
              {[karte.photoBefore, karte.photoAfter].map((src, index) =>
                src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 外部URLを任意に受けるため next/image は使わない
                  <img
                    key={index}
                    src={src}
                    alt={index === 0 ? "施術前" : "施術後"}
                    className="size-20 rounded-lg border border-gray-200 object-cover"
                  />
                ) : null,
              )}
            </div>
          ) : null}

          {karte.memo ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{karte.memo}</p>
          ) : null}
        </article>
      ))}

      {/* 【リチャード提案・採用】前回をコピーして新規カルテ。リピーターの入力が数秒で終わる。 */}
      <NewKarteLink customerId={customerId} copyFromLatest />
    </div>
  );
}

function NewKarteLink({
  customerId,
  copyFromLatest = false,
}: {
  customerId: string;
  copyFromLatest?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {copyFromLatest ? (
        <Link
          href={`/customers/${customerId}/kartes/new?copy=1`}
          className="tap-primary flex items-center justify-center rounded-xl bg-[var(--salon-main)] font-bold text-white"
        >
          前回をコピーして新規カルテ
        </Link>
      ) : null}
      <Link
        href={`/customers/${customerId}/kartes/new`}
        className="tap-primary flex items-center justify-center rounded-xl border border-gray-300 font-bold"
      >
        白紙で新規カルテ
      </Link>
    </div>
  );
}
