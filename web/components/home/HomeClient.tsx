"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckInPanel } from "@/components/checkin/CheckInPanel";
import { EvolutionGame } from "@/components/game/EvolutionGame";
import { WalletBar } from "@/components/wallet/WalletBar";
import { LEVELS } from "@/lib/game/levels";
import { getMaxUnlocked } from "@/lib/game/progress";

export function HomeClient() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [maxUnlocked, setMaxUnlocked] = useState(1);

  useEffect(() => {
    setMaxUnlocked(getMaxUnlocked());
  }, []);

  const activeLevel = useMemo(
    () => LEVELS.find((l) => l.id === activeId) ?? null,
    [activeId],
  );

  function refreshProgress() {
    setMaxUnlocked(getMaxUnlocked());
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,255,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(255,0,200,0.1),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.4)_2px,rgba(0,255,255,0.4)_4px)]" />

      <main className="relative z-10 mx-auto flex max-w-lg flex-col gap-6 px-4 pb-16 pt-8">
        <header className="text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.45em] text-cyan-400/90">
            Base · standard web
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-transparent sm:text-4xl bg-gradient-to-r from-cyan-200 via-fuchsia-300 to-lime-200 bg-clip-text drop-shadow-[0_0_24px_rgba(0,255,255,0.35)]">
            Evolution Simulator
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Drag across the field. Collect neon nutrients, fill the evolution meter, then
            breach the portal. English UI — tuned for mobile.
          </p>
        </header>

        <WalletBar />
        <CheckInPanel />

        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.25em] text-fuchsia-300/90">
            Missions
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {LEVELS.map((lv) => {
              const open = lv.id <= maxUnlocked;
              return (
                <li key={lv.id}>
                  <button
                    type="button"
                    disabled={!open}
                    onClick={() => setActiveId(lv.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-cyan-500/25 bg-zinc-950/70 px-4 py-3 text-left transition hover:border-cyan-400/50 hover:shadow-[0_0_24px_rgba(0,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <div>
                      <p className="font-display text-xs text-cyan-200/80">
                        Level {lv.id}
                      </p>
                      <p className="text-sm font-medium text-zinc-100">{lv.name}</p>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-fuchsia-300">
                      {open ? "Play" : "Locked"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {activeLevel ? (
        <EvolutionGame
          level={activeLevel}
          onClose={() => {
            setActiveId(null);
            refreshProgress();
          }}
          onCompleted={() => {
            refreshProgress();
          }}
        />
      ) : null}
    </div>
  );
}
