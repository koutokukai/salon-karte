"use client";

import { useActionState } from "react";
import { saveCustomerAction, type ActionState } from "@/lib/actions";
import { Field, FormError, PrimaryButton, TextArea, TextInput } from "@/components/ui";

export type CustomerDefaults = {
  customerId?: string;
  customerName?: string;
  phone?: string | null;
  email?: string | null;
  birthday?: string;
  familyInfo?: string | null;
  petInfo?: string | null;
  favoriteMovies?: string;
  favoriteDramas?: string;
  favoriteFoods?: string;
  memo?: string | null;
};

/**
 * 顧客フォーム。
 * 嗜好メモ（映画・ドラマ・食べ物）は競合にほぼ無い差別化項目。
 * 「前回の続きの会話ができる」ための欄なので、入力を軽くする（カンマ区切り）。
 */
export function CustomerForm({ defaults = {} }: { defaults?: CustomerDefaults }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveCustomerAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5 pb-28">
      {defaults.customerId ? (
        <input type="hidden" name="customerId" value={defaults.customerId} />
      ) : null}
      <FormError message={state.error} />

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <Field label="顧客名">
          <TextInput name="customerName" defaultValue={defaults.customerName ?? ""} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="電話番号">
            <TextInput type="tel" name="phone" defaultValue={defaults.phone ?? ""} />
          </Field>
          <Field label="誕生日">
            <TextInput type="date" name="birthday" defaultValue={defaults.birthday ?? ""} />
          </Field>
        </div>
        <Field label="メールアドレス">
          <TextInput type="email" name="email" defaultValue={defaults.email ?? ""} />
        </Field>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-[var(--salon-soft)] p-4">
        <p className="text-sm font-bold">会話のタネ</p>
        <Field label="家族構成">
          <TextInput name="familyInfo" defaultValue={defaults.familyInfo ?? ""} placeholder="ご主人・お子様2人 など" />
        </Field>
        <Field label="ペット">
          <TextInput name="petInfo" defaultValue={defaults.petInfo ?? ""} placeholder="トイプードル（ポチ） など" />
        </Field>
        <Field label="好きなドラマ" hint="カンマ区切りで複数入力できます">
          <TextInput name="favoriteDramas" defaultValue={defaults.favoriteDramas ?? ""} />
        </Field>
        <Field label="好きな映画" hint="カンマ区切りで複数入力できます">
          <TextInput name="favoriteMovies" defaultValue={defaults.favoriteMovies ?? ""} />
        </Field>
        <Field label="好きな食べ物" hint="カンマ区切りで複数入力できます">
          <TextInput name="favoriteFoods" defaultValue={defaults.favoriteFoods ?? ""} />
        </Field>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <Field label="特記事項" hint="アレルギー・禁忌など、施術前に必ず確認したいこと">
          <TextArea name="memo" defaultValue={defaults.memo ?? ""} rows={4} />
        </Field>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "保存中…" : "保存"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
