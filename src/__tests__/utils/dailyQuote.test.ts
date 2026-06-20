import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyQuote, getUpcomingDailyQuotes } from '../../utils/dailyQuote';
import { QUOTES } from '../../utils/quotes';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

function makeDateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

describe('getDailyQuote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  it('returns a valid quote from QUOTES on first launch', async () => {
    mockGetItem.mockResolvedValue(null);
    const quote = await getDailyQuote();
    expect(QUOTES).toContain(quote);
  });

  it('persists a new state to AsyncStorage on first launch', async () => {
    mockGetItem.mockResolvedValue(null);
    await getDailyQuote();
    expect(mockSetItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved.shuffledIndices).toHaveLength(QUOTES.length);
    expect(saved.cycleStartDate).toBe(makeDateKey(new Date()));
  });

  it('returns the same quote for the same day', async () => {
    mockGetItem.mockResolvedValue(null);
    const first = await getDailyQuote();

    // Subsequent call with stored state from the first call
    const storedState = JSON.parse(mockSetItem.mock.calls[0][1]);
    mockGetItem.mockResolvedValue(JSON.stringify(storedState));

    const second = await getDailyQuote();
    expect(first).toBe(second);
  });

  it('returns a different quote on the next day', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const state = {
      shuffledIndices: QUOTES.map((_, i) => i), // not shuffled, predictable
      cycleStartDate: makeDateKey(yesterday),
    };
    mockGetItem.mockResolvedValue(JSON.stringify(state));

    const quote = await getDailyQuote();
    // Day 1 (today) → index 1 in shuffledIndices
    expect(quote).toBe(QUOTES[1]);
  });

  it('extends the sequence with a fresh shuffle when a block is exhausted', async () => {
    const longAgo = new Date();
    longAgo.setDate(longAgo.getDate() - QUOTES.length); // dayIndex === QUOTES.length

    const state = {
      shuffledIndices: QUOTES.map((_, i) => i), // identity, predictable
      cycleStartDate: makeDateKey(longAgo),
    };
    mockGetItem.mockResolvedValue(JSON.stringify(state));

    const quote = await getDailyQuote();
    expect(QUOTES).toContain(quote);

    // The sequence is extended (not reset): a second full shuffle is appended
    // and cycleStartDate is preserved so future days stay consistent.
    expect(mockSetItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved.cycleStartDate).toBe(makeDateKey(longAgo));
    expect(saved.shuffledIndices).toHaveLength(QUOTES.length * 2);
    // Returned quote is the first entry of the newly-appended block.
    expect(quote).toBe(QUOTES[saved.shuffledIndices[QUOTES.length]]);
  });

  it('returns a fallback quote if AsyncStorage throws', async () => {
    mockGetItem.mockRejectedValue(new Error('storage failure'));
    const quote = await getDailyQuote();
    expect(QUOTES).toContain(quote);
  });

  it('shuffledIndices contains every quote index exactly once', async () => {
    mockGetItem.mockResolvedValue(null);
    await getDailyQuote();
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    const sorted = [...saved.shuffledIndices].sort((a, b) => a - b);
    expect(sorted).toEqual(QUOTES.map((_, i) => i));
  });
});

describe('getUpcomingDailyQuotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  it('returns one entry per requested day, offsets 0..n-1', async () => {
    mockGetItem.mockResolvedValue(null);
    const upcoming = await getUpcomingDailyQuotes(14);
    expect(upcoming).toHaveLength(14);
    expect(upcoming.map((u) => u.dayOffset)).toEqual(
      Array.from({ length: 14 }, (_, i) => i)
    );
    upcoming.forEach((u) => expect(QUOTES).toContain(u.quote));
  });

  it('gives distinct quotes across consecutive days within a block', async () => {
    const today = new Date();
    const state = {
      shuffledIndices: QUOTES.map((_, i) => i), // identity, predictable
      cycleStartDate: makeDateKey(today),
    };
    mockGetItem.mockResolvedValue(JSON.stringify(state));

    const upcoming = await getUpcomingDailyQuotes(5);
    // dayIndex 0 today → indices 0,1,2,3,4
    expect(upcoming.map((u) => u.quote)).toEqual([
      QUOTES[0],
      QUOTES[1],
      QUOTES[2],
      QUOTES[3],
      QUOTES[4],
    ]);
    // All distinct — this is the regression guard against "same quote every day".
    expect(new Set(upcoming.map((u) => u.quote)).size).toBe(5);
  });

  it("offset 0 matches getDailyQuote for the same stored state", async () => {
    const today = new Date();
    const state = {
      shuffledIndices: QUOTES.map((_, i) => i),
      cycleStartDate: makeDateKey(today),
    };
    mockGetItem.mockResolvedValue(JSON.stringify(state));

    const upcoming = await getUpcomingDailyQuotes(3);
    const todayQuote = await getDailyQuote();
    expect(upcoming[0].quote).toBe(todayQuote);
  });

  it('extends across a block boundary so the window is always full', async () => {
    // Start near the end of the first block so the lookahead spills into a new shuffle.
    const startDaysAgo = QUOTES.length - 2; // dayIndex === QUOTES.length - 2
    const start = new Date();
    start.setDate(start.getDate() - startDaysAgo);

    const state = {
      shuffledIndices: QUOTES.map((_, i) => i),
      cycleStartDate: makeDateKey(start),
    };
    mockGetItem.mockResolvedValue(JSON.stringify(state));

    const upcoming = await getUpcomingDailyQuotes(10);
    expect(upcoming).toHaveLength(10);
    upcoming.forEach((u) => expect(QUOTES).toContain(u.quote));
    // State extended to a second block and persisted.
    expect(mockSetItem).toHaveBeenCalled();
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved.shuffledIndices.length).toBeGreaterThanOrEqual(QUOTES.length * 2);
  });

  it('returns an empty array for a non-positive count', async () => {
    mockGetItem.mockResolvedValue(null);
    expect(await getUpcomingDailyQuotes(0)).toEqual([]);
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});
