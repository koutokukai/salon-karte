import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

/** 【サレオツ】共通パーツ。入力欄の高さ・余白はここでしか決めない。 */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "tap w-full rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-[var(--salon-main)] focus:ring-2 focus:ring-[var(--salon-main)]/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} py-3`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} py-3`} rows={props.rows ?? 3} />;
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="tap-primary w-full rounded-xl bg-[var(--salon-main)] px-4 text-base font-bold text-white active:opacity-80 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>{children}</div>
  );
}

/** アレルギー・禁忌の赤帯。色だけに頼らず ⚠ とテキストを併記する。 */
export function AlertBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--danger)] bg-[#fdeded] px-3 py-3 text-sm font-bold text-[var(--danger)]">
      <span aria-hidden>⚠</span>
      <span>{children}</span>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-[#fdeded] px-3 py-2 text-sm text-[var(--danger)]">
      {message}
    </p>
  );
}
