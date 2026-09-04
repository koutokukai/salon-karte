"use client";

import { useState, type ReactNode } from "react";

/** 【サレオツ】タブ。押し間違いを避けるため等幅・高さ48px。 */
export function Tabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={tab.key === active}
            onClick={() => setActive(tab.key)}
            className={`tap flex-1 text-sm font-bold ${
              tab.key === active
                ? "bg-[var(--salon-main)] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.key} role="tabpanel" hidden={tab.key !== active}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
