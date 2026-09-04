import Link from "next/link";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  if (await getTenant()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-center text-2xl font-bold tracking-tight">店舗を登録</h1>
      <SignupForm />
      <p className="text-center text-sm text-gray-600">
        登録済みの方は{" "}
        <Link href="/login" className="font-bold text-[var(--salon-main)] underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
