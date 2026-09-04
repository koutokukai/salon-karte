"use client";

import { ChipSelect } from "@/components/ChipSelect";
import { Field, TextArea, TextInput } from "@/components/ui";
import { RELAX_PRESSURES } from "@/lib/salon";
import type { KarteDefaults } from "./types";

/** リラク専用ブロック。禁忌はアレルギーと同格の事故防止項目として扱う。 */
export function KarteFormRelax({ defaults }: { defaults: KarteDefaults }) {
  return (
    <>
      <Field label="圧">
        <ChipSelect name="relaxPressureLevel" options={RELAX_PRESSURES} defaultValue={defaults.relaxPressureLevel} />
      </Field>
      <Field label="主訴" hint="肩こり・腰痛など、来店理由そのもの。">
        <TextInput name="relaxSymptom" defaultValue={defaults.relaxSymptom ?? ""} />
      </Field>
      <Field label="施術箇所">
        <TextArea name="relaxTargetArea" defaultValue={defaults.relaxTargetArea ?? ""} rows={2} />
      </Field>
      <Field label="オイル種別">
        <TextInput name="relaxOilType" defaultValue={defaults.relaxOilType ?? ""} />
      </Field>
      <Field label="禁忌事項" hint="妊娠中・持病など。上のアレルギー欄と併せて必ず確認する。">
        <TextInput name="relaxContraindication" defaultValue={defaults.relaxContraindication ?? ""} />
      </Field>
      <Field label="施術時間（分）">
        <TextInput type="number" inputMode="numeric" name="relaxDuration" defaultValue={defaults.relaxDuration ?? ""} />
      </Field>
    </>
  );
}
