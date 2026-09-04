"use client";

import { ChipSelect } from "@/components/ChipSelect";
import { Field, TextArea, TextInput } from "@/components/ui";
import { NAIL_SHAPES } from "@/lib/salon";
import type { KarteDefaults } from "./types";

/** ネイル専用ブロック。色ムラ事故を防ぐ「カラー配合」が主役。 */
export function KarteFormNail({ defaults }: { defaults: KarteDefaults }) {
  return (
    <>
      <Field label="カラー配合メモ" hint="次回同じ色を再現するための記録。ここが紙カルテの最大の弱点。">
        <TextArea name="nailColorFormula" defaultValue={defaults.nailColorFormula ?? ""} rows={3} />
      </Field>
      <Field label="形">
        <ChipSelect name="nailShape" options={NAIL_SHAPES} defaultValue={defaults.nailShape} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="長さ">
          <TextInput name="nailLength" defaultValue={defaults.nailLength ?? ""} />
        </Field>
        <Field label="オフ">
          <TextInput name="nailOffType" defaultValue={defaults.nailOffType ?? ""} />
        </Field>
      </div>
      <Field label="デザイン画像URL">
        <TextInput name="nailDesignPhoto" defaultValue={defaults.nailDesignPhoto ?? ""} placeholder="https://" />
      </Field>
      <Field label="施術時間（分）">
        <TextInput type="number" inputMode="numeric" name="nailDuration" defaultValue={defaults.nailDuration ?? ""} />
      </Field>
    </>
  );
}
