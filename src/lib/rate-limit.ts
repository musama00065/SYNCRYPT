const attempts = new Map<string, { count: number; expires: number }>();

export function rateLimit(ip: string, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.expires < now) {
    attempts.set(ip, { count: 1, expires: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (current.count >= max) return { ok: false, remaining: 0 };
  current.count += 1;
  return { ok: true, remaining: max - current.count };
}
