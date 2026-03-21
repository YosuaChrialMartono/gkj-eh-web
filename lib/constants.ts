export const DEFAULT_MODEL = "claude-opus-4-6";

export const MODELS = [
  { id: "claude-opus-4-6", label: "Claude Opus 4.6", description: "Most powerful — best for complex tasks" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", description: "Balanced speed and intelligence" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Fastest and most cost-effective" },
] as const;

export const DEFAULT_MAX_TOKENS = 16000;
export const STREAMING_MAX_TOKENS = 64000;

export const APP_NAME = "GKJ EH";
export const APP_DESCRIPTION = "AI-powered assistant platform";

export const NAV_ITEMS = [
  { label: "Chat", href: "/chat", icon: "MessageSquare" },
  { label: "Agents", href: "/agents", icon: "Bot" },
  { label: "History", href: "/history", icon: "Clock" },
] as const;
