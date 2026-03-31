/**
 * Parse Aladhan API time strings like "05:12" or "05:12 (GMT+03:00)".
 */
export function parseAladhanTimeString(raw: string): { hours: number; minutes: number } | null {
  if (!raw || typeof raw !== 'string') return null;
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}
