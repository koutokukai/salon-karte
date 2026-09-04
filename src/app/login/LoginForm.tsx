"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/actions";
import { Field, FormError, PrimaryButton, TextInput } from "@/components/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <Field label="メールアドレス">
        <TextInput type="email" name="email" autoComplete="email" required />
      </Field>
      <Field label="パスワード">
        <TextInput type="password" name="password" autoComplete="current-password" required />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "確認中…" : "ログイン"}
      </PrimaryButton>
    </form>
  );
}
