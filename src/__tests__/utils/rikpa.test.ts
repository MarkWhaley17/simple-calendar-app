import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RikpaEntry,
  addRikpaEntry,
  formatRikpaDayLabel,
  formatRikpaDuration,
  formatRikpaTotalDuration,
  getRikpaInsights,
  getRikpaTodaySummary,
  getRikpaWeekGroups,
  loadRikpaEntries,
  saveRikpaEntries,
} from '../../utils/rikpa';

const NOW = new Date('2026-05-19T14:00:00');

const makeEntry = (overrides: Partial<RikpaEntry> & { practice_at: number }): RikpaEntry => ({
  id: `rikpa-${overrides.practice_at}`,
  recognition: 3,
  duration: 0,
  notes: '',
  ...overrides,
});

const ms = (isoDate: string) => new Date(isoDate).getTime();

describe('rikpa utils', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // --- getRikpaTodaySummary ---

  describe('getRikpaTodaySummary', () => {
    it('returns zeros and null avgRecognition for empty entries', () => {
      const summary = getRikpaTodaySummary([], NOW);
      expect(summary.count).toBe(0);
      expect(summary.avgRecognition).toBeNull();
      expect(summary.totalDuration).toBe(0);
    });

    it('counts only entries from today', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00'), recognition: 4, duration: 60 }),
        makeEntry({ practice_at: ms('2026-05-19T12:00:00'), recognition: 2, duration: 30 }),
        makeEntry({ practice_at: ms('2026-05-18T09:00:00'), recognition: 5, duration: 120 }),
      ];
      const summary = getRikpaTodaySummary(entries, NOW);
      expect(summary.count).toBe(2);
      expect(summary.avgRecognition).toBe(3.0);
      expect(summary.totalDuration).toBe(90);
    });

    it('rounds avgRecognition to one decimal place', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00'), recognition: 1 }),
        makeEntry({ practice_at: ms('2026-05-19T09:00:00'), recognition: 2 }),
        makeEntry({ practice_at: ms('2026-05-19T10:00:00'), recognition: 3 }),
      ];
      const summary = getRikpaTodaySummary(entries, NOW);
      expect(summary.avgRecognition).toBe(2.0);
    });

    it('excludes duration of 0 from totalDuration count but sums correctly', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00'), duration: 0 }),
        makeEntry({ practice_at: ms('2026-05-19T09:00:00'), duration: 300 }),
      ];
      const summary = getRikpaTodaySummary(entries, NOW);
      expect(summary.totalDuration).toBe(300);
    });
  });

  // --- getRikpaInsights ---

  describe('getRikpaInsights', () => {
    it('returns all zeros for empty entries', () => {
      const insights = getRikpaInsights([], NOW);
      expect(insights.allTimeCount).toBe(0);
      expect(insights.streakDays).toBe(0);
      expect(insights.bestDayCount).toBe(0);
      expect(insights.period7.count).toBe(0);
      expect(insights.period7.avgRecognition).toBeNull();
      expect(insights.period7.totalDuration).toBe(0);
    });

    it('counts all-time entries', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-01T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-10T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }),
      ];
      expect(getRikpaInsights(entries, NOW).allTimeCount).toBe(3);
    });

    it('calculates streak for consecutive days ending today', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-18T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-17T08:00:00') }),
      ];
      expect(getRikpaInsights(entries, NOW).streakDays).toBe(3);
    });

    it('streak is 0 when no entry today', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-18T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-17T08:00:00') }),
      ];
      expect(getRikpaInsights(entries, NOW).streakDays).toBe(0);
    });

    it('streak breaks on a gap', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-17T08:00:00') }), // gap on 18th
      ];
      expect(getRikpaInsights(entries, NOW).streakDays).toBe(1);
    });

    it('identifies bestDayCount correctly', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-19T09:00:00') }),
        makeEntry({ practice_at: ms('2026-05-19T10:00:00') }),
        makeEntry({ practice_at: ms('2026-05-18T08:00:00') }),
      ];
      expect(getRikpaInsights(entries, NOW).bestDayCount).toBe(3);
    });

    it('period7 includes last 7 days inclusive', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00'), recognition: 5, duration: 60 }),
        makeEntry({ practice_at: ms('2026-05-13T08:00:00'), recognition: 3, duration: 30 }), // 7 days ago — included
        makeEntry({ practice_at: ms('2026-05-12T08:00:00'), recognition: 1, duration: 90 }), // 8 days ago — excluded
      ];
      const { period7 } = getRikpaInsights(entries, NOW);
      expect(period7.count).toBe(2);
      expect(period7.avgRecognition).toBe(4.0);
      expect(period7.totalDuration).toBe(90);
    });

    it('period30 and period90 cover the correct windows', () => {
      // cutoff for 30d = today - 29 days = Apr 20; cutoff for 90d = today - 89 days = Feb 19
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }), // today         — in 30d, in 90d
        makeEntry({ practice_at: ms('2026-04-20T08:00:00') }), // 29 days ago   — in 30d, in 90d
        makeEntry({ practice_at: ms('2026-04-19T08:00:00') }), // 30 days ago   — out of 30d, in 90d
        makeEntry({ practice_at: ms('2026-04-18T08:00:00') }), // 31 days ago   — out of 30d, in 90d
        makeEntry({ practice_at: ms('2026-02-19T08:00:00') }), // 89 days ago   — in 90d (on cutoff)
        makeEntry({ practice_at: ms('2026-02-18T08:00:00') }), // 90 days ago   — out of 90d
        makeEntry({ practice_at: ms('2026-02-17T08:00:00') }), // 91 days ago   — out of 90d
      ];
      const insights = getRikpaInsights(entries, NOW);
      expect(insights.period30.count).toBe(2);
      expect(insights.period90.count).toBe(5);
    });
  });

  // --- getRikpaWeekGroups ---

  describe('getRikpaWeekGroups', () => {
    it('returns empty array for no entries', () => {
      expect(getRikpaWeekGroups([], NOW)).toEqual([]);
    });

    it('groups a single entry into one week with one day', () => {
      const entries = [makeEntry({ practice_at: ms('2026-05-19T08:00:00') })];
      const groups = getRikpaWeekGroups(entries, NOW);
      expect(groups).toHaveLength(1);
      expect(groups[0].days).toHaveLength(1);
      expect(groups[0].totalCount).toBe(1);
    });

    it('groups entries from the same week together', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-18T08:00:00') }), // Mon
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }), // Tue — same week
      ];
      const groups = getRikpaWeekGroups(entries, NOW);
      expect(groups).toHaveLength(1);
      expect(groups[0].totalCount).toBe(2);
    });

    it('splits entries from different weeks into separate groups', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }), // week of May 18
        makeEntry({ practice_at: ms('2026-05-11T08:00:00') }), // week of May 11
      ];
      const groups = getRikpaWeekGroups(entries, NOW);
      expect(groups).toHaveLength(2);
    });

    it('sorts weeks newest first', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-11T08:00:00') }),
        makeEntry({ practice_at: ms('2026-05-19T08:00:00') }),
      ];
      const groups = getRikpaWeekGroups(entries, NOW);
      expect(new Date(groups[0].days[0].date) > new Date(groups[1].days[0].date)).toBe(true);
    });

    it('sorts entries within a day newest first', () => {
      const entries = [
        makeEntry({ practice_at: ms('2026-05-19T08:00:00'), id: 'rikpa-a' }),
        makeEntry({ practice_at: ms('2026-05-19T12:00:00'), id: 'rikpa-b' }),
      ];
      const groups = getRikpaWeekGroups(entries, NOW);
      expect(groups[0].days[0].entries[0].id).toBe('rikpa-b');
    });
  });

  // --- addRikpaEntry / loadRikpaEntries / saveRikpaEntries ---

  describe('storage', () => {
    it('loadRikpaEntries returns empty array when storage is empty', async () => {
      expect(await loadRikpaEntries()).toEqual([]);
    });

    it('saveRikpaEntries and loadRikpaEntries round-trip correctly', async () => {
      const entries = [makeEntry({ practice_at: ms('2026-05-19T08:00:00'), recognition: 4, duration: 120 })];
      await saveRikpaEntries(entries);
      const loaded = await loadRikpaEntries();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].recognition).toBe(4);
      expect(loaded[0].duration).toBe(120);
    });

    it('loadRikpaEntries returns empty array on corrupted storage', async () => {
      await AsyncStorage.setItem('@kalapa_rikpa_entries', 'not-json{{');
      expect(await loadRikpaEntries()).toEqual([]);
    });

    it('addRikpaEntry prepends new entry and saves', async () => {
      const existing = [makeEntry({ practice_at: ms('2026-05-18T08:00:00') })];
      const next = await addRikpaEntry(existing, 5, 60);
      expect(next).toHaveLength(2);
      expect(next[0].recognition).toBe(5);
      expect(next[0].duration).toBe(60);
      expect(next[0].notes).toBe('');
      const loaded = await loadRikpaEntries();
      expect(loaded).toHaveLength(2);
    });

    it('addRikpaEntry assigns a unique id', async () => {
      const next1 = await addRikpaEntry([], 3, 0);
      const next2 = await addRikpaEntry(next1, 3, 0);
      expect(next2[0].id).not.toBe(next2[1].id);
    });
  });

  // --- formatting ---

  describe('formatRikpaDuration', () => {
    it('returns em-dash for 0', () => expect(formatRikpaDuration(0)).toBe('—'));
    it('returns em-dash for negative', () => expect(formatRikpaDuration(-1)).toBe('—'));
    it('formats seconds under a minute', () => expect(formatRikpaDuration(45)).toBe('45s'));
    it('formats exactly 1 minute', () => expect(formatRikpaDuration(60)).toBe('1m'));
    it('formats minutes and seconds', () => expect(formatRikpaDuration(90)).toBe('1m 30s'));
    it('omits seconds when zero remainder', () => expect(formatRikpaDuration(120)).toBe('2m'));
  });

  describe('formatRikpaTotalDuration', () => {
    it('returns 0m for 0', () => expect(formatRikpaTotalDuration(0)).toBe('0m'));
    it('formats minutes', () => expect(formatRikpaTotalDuration(150)).toBe('2m'));
    it('formats hours only', () => expect(formatRikpaTotalDuration(7200)).toBe('2h'));
    it('formats hours and minutes', () => expect(formatRikpaTotalDuration(3690)).toBe('1h 1m'));
  });

  describe('formatRikpaDayLabel', () => {
    it('returns Today for today', () => {
      expect(formatRikpaDayLabel(new Date('2026-05-19T08:00:00'), NOW)).toBe('Today');
    });
    it('returns Yesterday for one day ago', () => {
      expect(formatRikpaDayLabel(new Date('2026-05-18T08:00:00'), NOW)).toBe('Yesterday');
    });
    it('returns formatted date for older dates', () => {
      const label = formatRikpaDayLabel(new Date('2026-05-10T08:00:00'), NOW);
      expect(label).toContain('May');
      expect(label).toContain('10');
    });
  });
});
