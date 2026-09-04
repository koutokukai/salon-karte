"use client";

import { Field, TextArea, TextInput } from "@/components/ui";
import type { KarteDefaults } from "./types";

/** ヘア専用ブロック。 */
export function KarteFormHair({ defaults }: { defaults: KarteDefaults }) {
  return (
    <>
      <Field label="カラー配合メモ" hint="薬剤・レシピ・放置時間まで残すと再現性が上がる。">
        <TextArea name="hairColorFormula" defaultValue={defaults.hairColorFormula ?? ""} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="カット長さ">
          <TextInput name="hairCutLength" defaultValue={defaults.hairCutLength ?? ""} />
        </Field>
        <Field label="パーマ種別">
          <TextInput name="hairPermType" defaultValue={defaults.hairPermType ?? ""} />
        </Field>
      </div>
      <Field label="トリートメント種別">
        <TextInput name="hairTreatmentType" defaultValue={defaults.hairTreatmentType ?? ""} />
      </Field>
      <Field label="使用薬剤・スタイリング剤" hint="店販提案の根拠になる。">
        <TextInput name="hairProductUsed" defaultValue={defaults.hairProductUsed ?? ""} />
      </Field>
      <Field label="施術時間（分）">
        <TextInput type="number" inputMode="numeric" name="hairDuration" defaultValue={defaults.hairDuration ?? ""} />
      </Field>
    </>
  );
}
