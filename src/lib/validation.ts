import { z } from "zod";
import { SALON_TYPES } from "@/lib/salon";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalInt = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  });

/** 新規店舗登録。salon_type はここでしか受け付けない。 */
export const tenantCreateSchema = z.object({
  tenantName: z.string().trim().min(1, "店舗名を入力してください").max(100),
  salonType: z.enum(SALON_TYPES),
  email: z.email("メールアドレスの形式が正しくありません").trim().toLowerCase(),
  password: z.string().min(8, "パスワードは8文字以上にしてください").max(200),
});

/**
 * 店舗情報の更新。
 * ⚠ 仕様の絶対ルール：salon_type は登録後に変更できない。
 *    strict() により salonType がフォームに紛れ込んだ時点でバリデーションエラーになる。
 */
export const tenantUpdateSchema = z
  .object({
    tenantName: z.string().trim().min(1).max(100),
    email: z.email().trim().toLowerCase(),
  })
  .strict();

/** 更新ペイロードから salon_type を検出して拒否する最終防壁。 */
export function assertNoSalonTypeChange(payload: Record<string, unknown>) {
  if ("salonType" in payload || "salon_type" in payload) {
    throw new Error("salon_type は登録後に変更できません");
  }
}

export const loginSchema = z.object({
  email: z.email("メールアドレスの形式が正しくありません").trim().toLowerCase(),
  password: z.string().min(1, "パスワードを入力してください"),
});

/** JSON 配列カラム用：カンマ区切り or 改行区切りの入力を配列に変換 */
const listField = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/[,、\n]/)
      .map((s) => s.trim())
      .filter(Boolean),
  );

export const customerSchema = z.object({
  customerName: z.string().trim().min(1, "顧客名を入力してください").max(100),
  phone: optionalText,
  email: optionalText,
  birthday: optionalText,
  familyInfo: optionalText,
  petInfo: optionalText,
  favoriteMovies: listField,
  favoriteDramas: listField,
  favoriteFoods: listField,
  memo: optionalText,
});

export const karteSchema = z.object({
  customerId: z.string().min(1, "顧客が指定されていません"),
  visitDate: z.string().min(1, "来店日を入力してください"),
  staffName: optionalText,

  // 共通
  menuName: optionalText,
  price: optionalInt,
  photoBefore: optionalText,
  photoAfter: optionalText,
  memo: optionalText,
  counselingNote: optionalText,
  allergyFlag: z
    .union([z.literal("on"), z.literal("true"), z.boolean(), z.undefined()])
    .transform((v) => v === "on" || v === "true" || v === true),
  allergyNote: optionalText,
  nextVisitGuide: optionalInt,

  // ネイル
  nailColorFormula: optionalText,
  nailDesignPhoto: optionalText,
  nailShape: optionalText,
  nailLength: optionalText,
  nailOffType: optionalText,
  nailDuration: optionalInt,

  // マツエク
  eyelashCurlType: optionalText,
  eyelashCount: optionalInt,
  eyelashThickness: optionalText,
  eyelashLength: optionalText,
  eyelashGlueType: optionalText,
  eyelashDesign: optionalText,
  eyelashDuration: optionalInt,

  // ヘア
  hairColorFormula: optionalText,
  hairTreatmentType: optionalText,
  hairCutLength: optionalText,
  hairPermType: optionalText,
  hairProductUsed: optionalText,
  hairDuration: optionalInt,

  // リラク
  relaxPressureLevel: optionalText,
  relaxTargetArea: optionalText,
  relaxOilType: optionalText,
  relaxSymptom: optionalText,
  relaxContraindication: optionalText,
  relaxDuration: optionalInt,
});

export const chatSchema = z.object({
  customerId: z.string().min(1),
  messageFrom: z.enum(["tenant", "customer"]).default("tenant"),
  messageBody: z.string().trim().min(1, "メッセージを入力してください").max(4000),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type KarteInput = z.infer<typeof karteSchema>;
