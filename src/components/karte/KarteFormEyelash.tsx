"use client";

import { ChipSelect } from "@/components/ChipSelect";
import { Field, TextInput } from "@/components/ui";
import { EYELASH_CURLS, EYELASH_THICKNESS } from "@/lib/salon";
import type { KarteDefaults } from "./types";

/** マツエク専用ブロック。カール・太さは選択式（施術中に片手で押せる）。 */
export function KarteFormEyelash({ defaults }: { defaults: KarteDefaults }) {
  return (
    <>
      <Field label="カール">
        <ChipSelect name="eyelashCurlType" options={EYELASH_CURLS} defaultValue={defaults.eyelashCurlType} />
      </Field>
      <Field label="太さ">
        <ChipSelect name="eyelashThickness" options={EYELASH_THICKNESS} defaultValue={defaults.eyelashThickness} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="本数">
          <TextInput type="number" inputMode="numeric" name="eyelashCount" defaultValue={defaults.eyelashCount ?? ""} />
        </Field>
        <Field label="長さ（mm）">
          <TextInput name="eyelashLength" defaultValue={defaults.eyelashLength ?? ""} />
        </Field>
      </div>
      <Field label="グルー種別" hint="アレルギー事故の追跡に使う。必ず記録すること。">
        <TextInput name="eyelashGlueType" defaultValue={defaults.eyelashGlueType ?? ""} />
      </Field>
      <Field label="デザイン">
        <TextInput name="eyelashDesign" defaultValue={defaults.eyelashDesign ?? ""} placeholder="ナチュラル / キュート など" />
      </Field>
      <Field label="施術時間（分）">
        <TextInput type="number" inputMode="numeric" name="eyelashDuration" defaultValue={defaults.eyelashDuration ?? ""} />
      </Field>
    </>
  );
}
