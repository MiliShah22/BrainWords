const KEY = "word_hunt_progress";

export type SavedProgress = {
  unlocked: number;
  results: number[];
};

export function loadProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      unlocked: typeof parsed.unlocked === "number" ? parsed.unlocked : 1,
      results: Array.isArray(parsed.results) ? parsed.results : [],
    };
  } catch {
    return null;
  }
}

export function saveProgress(progress: SavedProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(progress));
}

