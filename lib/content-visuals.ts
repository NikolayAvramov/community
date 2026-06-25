export const CONTENT_TYPE_VISUALS: Record<
  string,
  { gradient: string; glow: string; emoji: string; badge: string }
> = {
  POST: {
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glow: "shadow-violet-500/25",
    emoji: "✍️",
    badge: "bg-violet-100 text-violet-700 ring-violet-600/15 dark:bg-violet-500/15 dark:text-violet-300",
  },
  ARTICLE: {
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    glow: "shadow-sky-500/25",
    emoji: "📰",
    badge: "bg-sky-100 text-sky-700 ring-sky-600/15 dark:bg-sky-500/15 dark:text-sky-300",
  },
  EVENT: {
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    glow: "shadow-orange-500/25",
    emoji: "🎉",
    badge: "bg-amber-100 text-amber-800 ring-amber-600/15 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

const SPACE_GRADIENTS = [
  "from-rose-400 via-fuchsia-500 to-violet-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-violet-400 via-purple-500 to-fuchsia-600",
  "from-lime-400 via-green-500 to-emerald-600",
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-cyan-400 to-blue-600",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getContentVisuals(type: string) {
  return CONTENT_TYPE_VISUALS[type] ?? CONTENT_TYPE_VISUALS.POST;
}

export function getSpaceGradient(seed: string | number) {
  const index = typeof seed === "number" ? seed : hashString(seed);
  return SPACE_GRADIENTS[index % SPACE_GRADIENTS.length];
}

export function getAvatarGradient(seed: string) {
  return AVATAR_GRADIENTS[hashString(seed) % AVATAR_GRADIENTS.length];
}
