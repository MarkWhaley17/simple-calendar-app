import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyQuote } from '../../utils/dailyQuote';
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

  it('starts a new cycle when all quotes are exhausted', async () => {
    const longAgo = new Date();
    longAgo.setDate(longAgo.getDate() - QUOTES.length);

    const state = {
      shuffledIndices: QUOTES.map((_, i) => i),
      cycleStartDate: makeDateKey(longAgo),
    };
    mockGetItem.mockResolvedValue(JSON.stringify(state));

    const quote = await getDailyQuote();
    expect(QUOTES).toContain(quote);
    // A new state should have been saved
    expect(mockSetItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved.cycleStartDate).toBe(makeDateKey(new Date()));
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
