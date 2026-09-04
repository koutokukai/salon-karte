"use client";

import { useState } from "react";

/**
 * 【サレオツ】自由入力ではなくチップ選択。
 * 施術中に片手で押せるよう、1つあたり最低 48px の高さを確保する。
 */
export function ChipSelect({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: readonly string[];
  defaultValue?: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={value} />
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => setValue(selected ? "" : option)}
            className={`tap rounded-full border px-4 text-sm font-medium ${
              selected
                ? "border-[var(--salon-main)] bg-[var(--salon-main)] text-white"
                : "border-gray-300 bg-white text-gray-700"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
