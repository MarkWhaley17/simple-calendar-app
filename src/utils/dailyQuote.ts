/**
 * Daily quote engine.
 *
 * Rules:
 *  - One quote per calendar day (same quote all day).
 *  - Quotes are served in a random shuffled order.
 *  - The active client's full quote set is exhausted before any quote repeats.
 *  - When a block is exhausted, a fresh shuffle is appended and the
 *    sequence continues — the in-app quote and the pre-scheduled quote
 *    notifications read from the same sequence, so they always agree.
 *
 * State persisted in AsyncStorage:
 *  {
 *    shuffledIndices: number[];   // one or more full QUOTES-length shuffles, concatenated
 *    cycleStartDate: string;      // YYYY-MM-DD of day 0 (offset 0) in shuffledIndices
 *  }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const QUOTES = config.quotes;

const STORAGE_KEY = '@kalapa_daily_quote_state';

interface DailyQuoteState {
  shuffledIndices: number[];
  cycleStartDate: string; // YYYY-MM-DD
}

export interface UpcomingQuote {
  dayOffset: number; // 0 = today, 1 = tomorrow, ...
  quote: string;
}

function dateKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function todayKey(): string {
  return dateKey(new Date());
}

function shuffle(indices: number[]): number[] {
  const arr = [...indices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function fullShuffle(): number[] {
  return shuffle(QUOTES.map((_, i) => i));
}

function daysBetween(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  // Use noon to avoid DST edge-cases
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  return Math.round((b - a) / msPerDay);
}

function freshState(startDate: string): DailyQuoteState {
  return {
    shuffledIndices: fullShuffle(),
    cycleStartDate: startDate,
  };
}

/**
 * Resolves the persisted state so it covers today plus `lookaheadDays` ahead.
 * Pure (no I/O): callers persist the returned state when `mutated` is true.
 */
function resolvePlan(
  raw: string | null,
  today: string,
  lookaheadDays: number
): { state: DailyQuoteState; dayIndex: number; mutated: boolean } {
  let state: DailyQuoteState = raw ? JSON.parse(raw) : freshState(today);
  let mutated = !raw;

  let dayIndex = daysBetween(state.cycleStartDate, today);

  // Clock moved backward before the cycle start (or state is corrupt) — restart from today.
  if (dayIndex < 0) {
    state = freshState(today);
    dayIndex = 0;
    mutated = true;
  }

  // Ensure the sequence covers today and the requested lookahead window,
  // appending fresh full shuffles as each 115-quote block is exhausted.
  const lastNeeded = dayIndex + Math.max(lookaheadDays, 0);
  while (state.shuffledIndices.length <= lastNeeded) {
    state = {
      ...state,
      shuffledIndices: [...state.shuffledIndices, ...fullShuffle()],
    };
    mutated = true;
  }

  return { state, dayIndex, mutated };
}

/**
 * Returns the quote that should be shown today.
 * Loads and (if necessary) updates the persisted shuffle state.
 */
export async function getDailyQuote(): Promise<string> {
  const today = todayKey();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const { state, dayIndex, mutated } = resolvePlan(raw, today, 0);
    if (mutated) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return QUOTES[state.shuffledIndices[dayIndex]];
  } catch {
    // Fallback — never crash the UI over a quote
    return QUOTES[0];
  }
}

/**
 * Returns the quote for each of the next `count` days, starting with today
 * (dayOffset 0). Used to pre-schedule daily quote notifications so every day
 * gets a distinct quote drawn from the same sequence as the in-app quote.
 */
export async function getUpcomingDailyQuotes(count: number): Promise<UpcomingQuote[]> {
  const today = todayKey();
  const n = Math.max(count, 0);
  if (n === 0) return [];

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const { state, dayIndex, mutated } = resolvePlan(raw, today, n - 1);
    if (mutated) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return Array.from({ length: n }, (_, i) => ({
      dayOffset: i,
      quote: QUOTES[state.shuffledIndices[dayIndex + i]],
    }));
  } catch {
    // Fallback — degraded (repeats the safe quote) but never crashes scheduling.
    return Array.from({ length: n }, (_, i) => ({ dayOffset: i, quote: QUOTES[0] }));
  }
}
