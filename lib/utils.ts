// ─── 날짜/시간 포맷 ────────────────────────────────────────────
export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function formatTimeRange(start: number, end: number): string {
  return `${formatTime(start)} ~ ${formatTime(end)}`;
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

// ─── 주 범위 계산 ───────────────────────────────────────────────
export function getWeekRange(date: Date): { start: number; end: number } {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7)); // 월요일 기준
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon.getTime(), end: sun.getTime() };
}

export function getWeekDays(weekStart: number): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// ─── 이벤트 겹침 (QUIET 통합) ──────────────────────────────────
export function mergeQuietRanges(
  events: Array<{ startAt: number; endAt: number }>,
): Array<{ start: number; end: number }> {
  if (!events.length) return [];
  const sorted = [...events].sort((a, b) => a.startAt - b.startAt);
  const merged: Array<{ start: number; end: number }> = [];
  let cur = { start: sorted[0].startAt, end: sorted[0].endAt };
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startAt <= cur.end) {
      cur.end = Math.max(cur.end, sorted[i].endAt);
    } else {
      merged.push(cur);
      cur = { start: sorted[i].startAt, end: sorted[i].endAt };
    }
  }
  merged.push(cur);
  return merged;
}

// ─── 초대코드 생성 ─────────────────────────────────────────────
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── 현재 진행 중인지 확인 ────────────────────────────────────
export function isNowActive(startAt: number, endAt: number): boolean {
  const now = Date.now();
  return now >= startAt && now <= endAt;
}

// ─── 날짜 레이블 ───────────────────────────────────────────────
export function dateDayLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
}
