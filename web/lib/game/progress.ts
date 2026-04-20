const STORAGE_KEY = "evolution_sim_v1";

type Stored = { maxUnlocked: number };

function parseStored(): Stored {
  if (typeof window === "undefined") return { maxUnlocked: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { maxUnlocked: 1 };
    const j = JSON.parse(raw) as Partial<Stored>;
    const maxUnlocked =
      typeof j.maxUnlocked === "number" && Number.isFinite(j.maxUnlocked) && j.maxUnlocked >= 1
        ? Math.floor(j.maxUnlocked)
        : 1;
    return { maxUnlocked };
  } catch {
    return { maxUnlocked: 1 };
  }
}

/** Highest level id the player may start (starts at 1). */
export function getMaxUnlocked(): number {
  return parseStored().maxUnlocked;
}

/** Call when level `levelId` is completed; returns new max unlocked level id. */
export function completeLevel(levelId: number): number {
  const next = Math.max(parseStored().maxUnlocked, levelId + 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ maxUnlocked: next }));
  return next;
}

export function isLevelUnlocked(levelId: number): boolean {
  return levelId <= getMaxUnlocked();
}
