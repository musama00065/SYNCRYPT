export const AVATAR_PRESETS = Array.from({ length: 50 }, (_, i) => {
  const seed = `syncrypt-avatar-${i + 1}`;
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
});

export function isAllowedAvatarPreset(url: string) {
  return AVATAR_PRESETS.includes(url);
}
