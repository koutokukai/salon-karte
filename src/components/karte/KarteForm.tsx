"use client";

import { useActionState } from "react";
import type { SalonType } from "@/lib/salon";
import { Field, FormError, PrimaryButton, TextArea, TextInput } from "@/components/ui";
import { KarteFormNail } from "./KarteFormNail";
import { KarteFormEyelash } from "./KarteFormEyelash";
import { KarteFormHair } from "./KarteFormHair";
import { KarteFormRelax } from "./KarteFormRelax";
import type { KarteDefaults, KarteFormState, SaveKarteAction } from "./types";

/**
 * カルテ入力フォーム（親）。
 * salon_type を読んで業種別の子コンポーネントを呼び分ける。
 * ⚠ DBスキーマは1本のまま。変わるのは中央ブロックと色だけ。
 */
export function KarteForm({
  salonType,
  customerId,
  defaults,
  action,
}: {
  salonType: SalonType;
  customerId: string;
  defaults: KarteDefaults;
  action: SaveKarteAction;
}) {
  const [state, formAction, pending] = useActionState<KarteFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-5 pb-28">
      <input type="hidden" name="customerId" value={customerId} />
      <FormError message={state.error} />

      {/* ── 共通ヘッダ ── */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <Field label="来店日">
          <TextInput type="date" name="visitDate" defaultValue={defaults.visitDate} required />
        </Field>
        <Field label="担当スタッフ">
          <TextInput name="staffName" defaultValue={defaults.staffName ?? ""} />
        </Field>
        <Field label="メニュー">
          <TextInput name="menuName" defaultValue={defaults.menuName ?? ""} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="金額（円）">
            <TextInput type="number" inputMode="numeric" name="price" defaultValue={defaults.price ?? ""} />
          </Field>
          <Field label="次回来店目安（日）">
            <TextInput
              type="number"
              inputMode="numeric"
              name="nextVisitGuide"
              defaultValue={defaults.nextVisitGuide ?? ""}
            />
          </Field>
        </div>
      </div>

      {/* ── 業種別ブロック ── */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-[var(--salon-soft)] p-4">
        {salonType === "nail" && <KarteFormNail defaults={defaults} />}
        {salonType === "eyelash" && <KarteFormEyelash defaults={defaults} />}
        {salonType === "hair" && <KarteFormHair defaults={defaults} />}
        {salonType === "relax" && <KarteFormRelax defaults={defaults} />}
      </div>

      {/* ── 写真 ── */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Field label="施術前 写真URL">
          <TextInput name="photoBefore" defaultValue={defaults.photoBefore ?? ""} placeholder="https://" />
        </Field>
        <Field label="施術後 写真URL">
          <TextInput name="photoAfter" defaultValue={defaults.photoAfter ?? ""} placeholder="https://" />
        </Field>
      </div>

      {/* ── メモ・アレルギー ── */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <Field label="カウンセリング・ご要望">
          <TextArea name="counselingNote" defaultValue={defaults.counselingNote ?? ""} />
        </Field>
        <Field label="施術メモ">
          <TextArea name="memo" defaultValue={defaults.memo ?? ""} />
        </Field>
        <label className="tap flex items-center gap-3 rounded-lg border border-[var(--danger)] px-3">
          <input
            type="checkbox"
            name="allergyFlag"
            defaultChecked={defaults.allergyFlag}
            className="size-5 accent-[var(--danger)]"
          />
          <span className="text-sm font-bold text-[var(--danger)]">⚠ アレルギー・禁忌あり</span>
        </label>
        <Field label="アレルギー・禁忌の内容">
          <TextInput name="allergyNote" defaultValue={defaults.allergyNote ?? ""} />
        </Field>
      </div>

      {/* 【サレオツ】主要アクションは画面下部に固定。親指で押せる位置に置く。 */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "保存中…" : "カルテを保存"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
