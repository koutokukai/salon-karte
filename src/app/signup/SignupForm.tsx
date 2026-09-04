"use client";

import { useActionState } from "react";
import { signupAction, type ActionState } from "@/lib/actions";
import { Field, FormError, PrimaryButton, TextInput } from "@/components/ui";
import { SALON_META, SALON_TYPES } from "@/lib/salon";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signupAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <Field label="店舗名">
        <TextInput name="tenantName" required maxLength={100} />
      </Field>
      <Field label="業種" hint="⚠ 登録後は変更できません。慎重に選んでください。">
        <div className="grid grid-cols-2 gap-2">
          {SALON_TYPES.map((type) => (
            <label
              key={type}
              className="tap flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 has-checked:border-[var(--salon-main)] has-checked:bg-[var(--salon-soft)]"
            >
              <input type="radio" name="salonType" value={type} required className="size-4" />
              <span className="text-sm font-medium">{SALON_META[type].label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="メールアドレス（ログインID）">
        <TextInput type="email" name="email" autoComplete="email" required />
      </Field>
      <Field label="パスワード" hint="8文字以上">
        <TextInput type="password" name="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "登録中…" : "登録する"}
      </PrimaryButton>
    </form>
  );
}
