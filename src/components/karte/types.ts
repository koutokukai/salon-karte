import type { Karte } from "@/generated/prisma/client";

export type KarteFormState = { error?: string };

export type SaveKarteAction = (
  state: KarteFormState,
  formData: FormData,
) => Promise<KarteFormState>;

/** 新規作成時の初期値。「前回をコピー」では直前のカルテから引き継ぐ。 */
export type KarteDefaults = Omit<
  Partial<Karte>,
  "visitDate" | "createdAt" | "updatedAt" | "price" | "nextVisitGuide"
> & {
  visitDate: string;
  price?: number | string | null;
  nextVisitGuide?: number | string | null;
};
