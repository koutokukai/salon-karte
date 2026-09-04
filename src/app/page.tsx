import { redirect } from "next/navigation";
import { getTenant } from "@/lib/auth";

export default async function Home() {
  redirect((await getTenant()) ? "/dashboard" : "/login");
}
