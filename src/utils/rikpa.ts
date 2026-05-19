import AsyncStorage from '@react-native-async-storage/async-storage';

const RIKPA_ENTRIES_KEY = '@kalapa_rikpa_entries';

export interface RikpaEntry {
  id: string;
  practice_at: number; // Unix ms
  recognition: number; // 1–5
  duration: number;    // seconds, 0 = not recorded
  notes: string;       // reserved
}

export interface RikpaTodaySummary {
  count: number;
  avgRecognition: number | null;
  totalDuration: number; // seconds
}

export interface RikpaPeriodStats {
  count: number;
  avgRecognition: number | null;
  totalDuration: number; // seconds
}

export interface RikpaInsights {
  allTimeCount: number;
  streakDays: number;
  bestDayCount: number;
  period7: RikpaPeriodStats;
  period30: RikpaPeriodStats;
  period90: RikpaPeriodStats;
}

export interface RikpaDaySummary {
  dateKey: string;
  date: Date;
  entries: RikpaEntry[];
  count: number;
  avgRecognition: number;
  totalDuration: number;
}

export interface RikpaWeekGroup {
  weekLabel: string;
  days: RikpaDaySummary[];
  totalCount: number;
}

// --- Storage ---

export const loadRikpaEntries = async (): Promise<RikpaEntry[]> => {
  try {
    const value = await AsyncStorage.getItem(RIKPA_ENTRIES_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as RikpaEntry[];
  } catch {
    return [];
  }
};

export const saveRikpaEntries = async (entries: RikpaEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RIKPA_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save rikpa entries', error);
  }
};

export const addRikpaEntry = async (
  entries: RikpaEntry[],
  recognition: number,
  duration: number
): Promise<RikpaEntry[]> => {
  const entry: RikpaEntry = {
    id: `rikpa-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    practice_at: Date.now(),
    recognition,
    duration,
    notes: '',
  };
  const next = [entry, ...entries];
  await saveRikpaEntries(next);
  return next;
};

// --- Date helpers ---

export const rikpaDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const normalizeDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

// --- Stats ---

export const getRikpaTodaySummary = (entries: RikpaEntry[], now = new Date()): RikpaTodaySummary => {
  const todayKey = rikpaDateKey(now);
  const todayEntries = entries.filter(e => rikpaDateKey(new Date(e.practice_at)) === todayKey);
  if (todayEntries.length === 0) {
    return { count: 0, avgRecognition: null, totalDuration: 0 };
  }
  const avgRecognition =
    Math.round((todayEntries.reduce((s, e) => s + e.recognition, 0) / todayEntries.length) * 10) / 10;
  return {
    count: todayEntries.length,
    avgRecognition,
    totalDuration: todayEntries.reduce((s, e) => s + e.duration, 0),
  };
};

export const getRikpaInsights = (entries: RikpaEntry[], now = new Date()): RikpaInsights => {
  const today = normalizeDay(now);

  const entryDayKeys = new Set(entries.map(e => rikpaDateKey(new Date(e.practice_at))));
  let streakDays = 0;
  const cursor = new Date(today);
  while (entryDayKeys.has(rikpaDateKey(cursor))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const countByDay: Record<string, number> = {};
  entries.forEach(e => {
    const k = rikpaDateKey(new Date(e.practice_at));
    countByDay[k] = (countByDay[k] || 0) + 1;
  });
  const bestDayCount = Object.values(countByDay).length > 0
    ? Math.max(...Object.values(countByDay))
    : 0;

  const periodStats = (days: number): RikpaPeriodStats => {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const filtered = entries.filter(e => normalizeDay(new Date(e.practice_at)) >= cutoff);
    if (filtered.length === 0) return { count: 0, avgRecognition: null, totalDuration: 0 };
    return {
      count: filtered.length,
      avgRecognition:
        Math.round((filtered.reduce((s, e) => s + e.recognition, 0) / filtered.length) * 10) / 10,
      totalDuration: filtered.reduce((s, e) => s + e.duration, 0),
    };
  };

  return {
    allTimeCount: entries.length,
    streakDays,
    bestDayCount,
    period7: periodStats(7),
    period30: periodStats(30),
    period90: periodStats(90),
  };
};

export const getRikpaWeekGroups = (entries: RikpaEntry[], now = new Date()): RikpaWeekGroup[] => {
  if (entries.length === 0) return [];

  const byDay: Record<string, RikpaEntry[]> = {};
  entries.forEach(e => {
    const k = rikpaDateKey(new Date(e.practice_at));
    if (!byDay[k]) byDay[k] = [];
    byDay[k].push(e);
  });

  const days: RikpaDaySummary[] = Object.entries(byDay)
    .map(([k, dayEntries]) => {
      const avg =
        dayEntries.reduce((s, e) => s + e.recognition, 0) / dayEntries.length;
      return {
        dateKey: k,
        date: new Date(dayEntries[0].practice_at),
        entries: [...dayEntries].sort((a, b) => b.practice_at - a.practice_at),
        count: dayEntries.length,
        avgRecognition: Math.round(avg * 10) / 10,
        totalDuration: dayEntries.reduce((s, e) => s + e.duration, 0),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getMondayOf = (date: Date): Date => {
    const d = normalizeDay(date);
    const dayOfWeek = d.getDay(); // 0=Sun
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mon = new Date(d);
    mon.setDate(d.getDate() - diff);
    return mon;
  };

  const formatShort = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const weekMap = new Map<string, RikpaDaySummary[]>();
  const weekOrder: string[] = [];

  days.forEach(day => {
    const mon = getMondayOf(day.date);
    const wKey = rikpaDateKey(mon);
    if (!weekMap.has(wKey)) {
      weekMap.set(wKey, []);
      weekOrder.push(wKey);
    }
    weekMap.get(wKey)!.push(day);
  });

  return weekOrder.map(wKey => {
    const weekDays = weekMap.get(wKey)!;
    const mon = getMondayOf(weekDays[0].date);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return {
      weekLabel: `${formatShort(mon)} – ${formatShort(sun)}`,
      days: weekDays,
      totalCount: weekDays.reduce((s, d) => s + d.count, 0),
    };
  });
};

// --- Formatting ---

export const formatRikpaDuration = (seconds: number): string => {
  if (seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

export const formatRikpaTotalDuration = (seconds: number): string => {
  if (seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

export const formatRikpaDayLabel = (date: Date, now = new Date()): string => {
  const today = normalizeDay(now);
  const d = normalizeDay(date);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatRikpaEntryTime = (practiceAt: number): string =>
  new Date(practiceAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
