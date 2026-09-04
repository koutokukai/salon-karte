"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendChatAction, type ActionState } from "@/lib/actions";
import { FormError } from "@/components/ui";

export type ChatMessage = {
  chatId: string;
  messageFrom: string;
  messageBody: string;
  createdAt: string;
};

/** チャット（問い合わせ）。大会エントリーの Chat 実装を踏襲した構成。 */
export function ChatPanel({
  customerId,
  messages,
}: {
  customerId: string;
  messages: ChatMessage[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(sendChatAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {messages.length === 0 ? (
          <li className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            まだメッセージはありません。
          </li>
        ) : (
          messages.map((message) => {
            const fromTenant = message.messageFrom === "tenant";
            return (
              <li key={message.chatId} className={fromTenant ? "text-right" : "text-left"}>
                <span
                  className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-left text-sm ${
                    fromTenant
                      ? "bg-[var(--salon-main)] text-white"
                      : "border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {message.messageBody}
                </span>
                <span className="mt-1 block text-[11px] text-gray-400">{message.createdAt}</span>
              </li>
            );
          })
        )}
      </ul>

      <form ref={formRef} action={formAction} className="space-y-2">
        <FormError message={state.error} />
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="messageFrom" value="tenant" />
        <div className="flex gap-2">
          <input
            name="messageBody"
            required
            maxLength={4000}
            placeholder="メッセージを入力"
            className="tap w-full rounded-lg border border-gray-300 bg-white px-3 text-base"
          />
          <button
            type="submit"
            disabled={pending}
            className="tap shrink-0 rounded-lg bg-[var(--salon-main)] px-4 font-bold text-white disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
