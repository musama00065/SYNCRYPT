const presence = new Map<string, { online: boolean; lastSeen: number }>();
const typing = new Map<string, { typing: boolean; updatedAt: number }>();

export function setPresence(userId: string, online: boolean) {
  presence.set(userId, { online, lastSeen: Date.now() });
}

export function getPresence() {
  return Array.from(presence.entries()).map(([userId, state]) => ({ userId, ...state }));
}

export function setTyping(key: string, isTyping: boolean) {
  typing.set(key, { typing: isTyping, updatedAt: Date.now() });
}

export function getTyping() {
  const now = Date.now();
  return Array.from(typing.entries())
    .filter(([, v]) => now - v.updatedAt < 10_000)
    .map(([key, state]) => ({ key, ...state }));
}
