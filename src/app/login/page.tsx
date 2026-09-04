import Link from "next/link";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getTenant()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 p-6">
      <h1 className="text-center text-2xl font-bold tracking-tight">サロンカルテ</h1>
      <LoginForm />
      <p className="text-center text-sm text-gray-600">
        はじめての方は{" "}
        <Link href="/signup" className="font-bold text-[var(--salon-main)] underline">
          店舗を登録
        </Link>
      </p>
    </main>
  );
}
