/**
 * Daily quote engine.
 *
 * Rules:
 *  - One quote per calendar day (same quote all day).
 *  - Quotes are served in a random shuffled order.
 *  - The full set of 115 quotes is exhausted before any quote repeats.
 *  - A fresh shuffle begins the day after the last quote in a cycle is shown.
 *
 * State persisted in AsyncStorage:
 *  {
 *    shuffledIndices: number[];   // shuffled order of QUOTES indices
 *    cycleStartDate: string;      // YYYY-MM-DD of day 0 in the current cycle
 *  }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUOTES } from './quotes';

const STORAGE_KEY = '@kalapa_daily_quote_state';

interface DailyQuoteState {
  shuffledIndices: number[];
  cycleStartDate: string; // YYYY-MM-DD
}

function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function shuffle(indices: number[]): number[] {
  const arr = [...indices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
    shuffledIndices: shuffle(QUOTES.map((_, i) => i)),
    cycleStartDate: startDate,
  };
}

/**
 * Returns the quote that should be shown today.
 * Loads and (if necessary) updates the persisted shuffle state.
 */
export async function getDailyQuote(): Promise<string> {
  const today = todayKey();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    let state: DailyQuoteState = raw ? JSON.parse(raw) : freshState(today);

    const dayIndex = daysBetween(state.cycleStartDate, today);

    if (dayIndex < 0 || dayIndex >= QUOTES.length) {
      // Cycle complete (or clock went backward) — start a new cycle from today
      state = freshState(today);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return QUOTES[state.shuffledIndices[0]];
    }

    if (!raw) {
      // Persist the newly-created state
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    return QUOTES[state.shuffledIndices[dayIndex]];
  } catch {
    // Fallback — never crash the UI over a quote
    return QUOTES[0];
  }
}
