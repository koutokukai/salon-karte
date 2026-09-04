/**
 * 業種（salon_type）の定義。
 * ⚠ tenants.salon_type は登録時に1度だけ設定され、以降変更できない。
 */
export const SALON_TYPES = ["nail", "eyelash", "hair", "relax"] as const;
export type SalonType = (typeof SALON_TYPES)[number];

export function isSalonType(value: unknown): value is SalonType {
  return typeof value === "string" && (SALON_TYPES as readonly string[]).includes(value);
}

type SalonMeta = {
  label: string;
  /** 【メガネ】来店リマインドの標準周期（日）。Phase2 の LINE 配信で使う */
  defaultVisitCycleDays: number;
};

export const SALON_META: Record<SalonType, SalonMeta> = {
  nail: { label: "ネイルサロン", defaultVisitCycleDays: 24 },
  eyelash: { label: "マツエクサロン", defaultVisitCycleDays: 21 },
  hair: { label: "ヘアサロン", defaultVisitCycleDays: 49 },
  relax: { label: "リラクゼーション", defaultVisitCycleDays: 14 },
};

/** 【サレオツ】業種別の選択チップ。自由入力より選択を優先する */
export const NAIL_SHAPES = ["ラウンド", "オーバル", "スクエア", "スクエアオフ", "アーモンド", "バレリーナ"];
export const EYELASH_CURLS = ["Jカール", "Bカール", "Cカール", "Dカール", "SCカール"];
export const EYELASH_THICKNESS = ["0.10mm", "0.12mm", "0.15mm", "0.18mm", "0.20mm"];
export const RELAX_PRESSURES = ["弱", "やや弱", "中", "やや強", "強"];
