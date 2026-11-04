export type MistakeAction = "mastered" | "favorite" | "remove";

export type MistakePrompt = {
  title: string;
  body: string;
  confirm: string;
};

type FlagStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const COPY: Record<MistakeAction, MistakePrompt> = {
  mastered: {
    title: "Mark as mastered?",
    body: "This question will leave your review queue. Your answer history and favorite status will be kept.",
    confirm: "Mark as mastered",
  },
  favorite: {
    title: "Add to Favorites?",
    body: "You can find this question under Favorites. Its review schedule stays the same.",
    confirm: "Add to Favorites",
  },
  remove: {
    title: "Delete this record?",
    body: "This clears the wrong-answer count, favorite status, and review schedule for this question.",
    confirm: "Delete record",
  },
};

export function mistakePrompt(
  action: MistakeAction,
  opts: { favorited: boolean; seenMastered: boolean; seenFavorite: boolean },
): MistakePrompt | null {
  if (action === "remove") return COPY.remove;
  if (action === "mastered") return opts.seenMastered ? null : COPY.mastered;
  return opts.favorited || opts.seenFavorite ? null : COPY.favorite;
}

function promptKey(userId: string) {
  return `az-mistake-prompts:${userId}`;
}

export function readMistakePrompts(storage: FlagStore, userId: string) {
  try {
    const raw = JSON.parse(storage.getItem(promptKey(userId)) || "{}") as { mastered?: unknown; favorite?: unknown };
    return { mastered: raw.mastered === true, favorite: raw.favorite === true };
  } catch {
    return { mastered: false, favorite: false };
  }
}

/** ponytail: localStorage keyed by account id. Move onto the user row if the note must follow the account to another browser. */
export function markMistakePromptSeen(storage: FlagStore, userId: string, kind: "mastered" | "favorite") {
  try {
    const current = readMistakePrompts(storage, userId);
    storage.setItem(promptKey(userId), JSON.stringify({ ...current, [kind]: true }));
  } catch {
    // Storage can be blocked. The note shows again next time.
  }
}
