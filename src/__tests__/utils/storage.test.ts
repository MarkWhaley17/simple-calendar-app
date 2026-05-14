import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '../../types';
import { clearEvents, loadEvents, saveEvents } from '../../utils/storage';

describe('storage utils', () => {
  const sampleEvent: CalendarEvent = {
    id: 'session-1',
    title: 'Morning Practice',
    fromDate: new Date('2026-03-01T08:00:00.000Z'),
    toDate: new Date('2026-03-01T08:30:00.000Z'),
    accumulations: 108,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock)();
  });

  it('saves as a plain array and keeps previous main as backup', async () => {
    await AsyncStorage.setItem(
      '@kalapa_calendar_events',
      JSON.stringify([{ ...sampleEvent, title: 'Older Session' }])
    );

    await saveEvents([sampleEvent]);

    const mainRaw = await AsyncStorage.getItem('@kalapa_calendar_events');
    const backupRaw = await AsyncStorage.getItem('@kalapa_calendar_events_backup');
    expect(mainRaw).not.toBeNull();
    expect(backupRaw).not.toBeNull();

    const mainParsed = JSON.parse(mainRaw as string);
    expect(Array.isArray(mainParsed)).toBe(true);
    expect(mainParsed[0].id).toBe('session-1');

    const backupParsed = JSON.parse(backupRaw as string);
    expect(backupParsed[0].title).toBe('Older Session');
  });

  it('loads and hydrates events from main storage', async () => {
    await saveEvents([sampleEvent]);

    const loaded = await loadEvents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(sampleEvent.id);
    expect(loaded[0].fromDate).toBeInstanceOf(Date);
    expect(loaded[0].toDate).toBeInstanceOf(Date);
  });

  it('falls back to backup when main storage is corrupted', async () => {
    await AsyncStorage.setItem('@kalapa_calendar_events', 'not-json');
    await AsyncStorage.setItem(
      '@kalapa_calendar_events_backup',
      JSON.stringify([sampleEvent])
    );

    const loaded = await loadEvents();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('session-1');
  });

  it('loads legacy envelope format for backward compatibility', async () => {
    await AsyncStorage.setItem(
      '@kalapa_calendar_events',
      JSON.stringify({ version: 1, savedAt: '2026-03-15T00:00:00.000Z', events: [sampleEvent] })
    );

    const loaded = await loadEvents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('session-1');
    expect(loaded[0].fromDate).toBeInstanceOf(Date);
  });

  it('loads legacy plain-array format for backward compatibility', async () => {
    await AsyncStorage.setItem(
      '@kalapa_calendar_events',
      JSON.stringify([sampleEvent])
    );

    const loaded = await loadEvents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('session-1');
    expect(loaded[0].fromDate).toBeInstanceOf(Date);
  });

  it('clears main and backup keys', async () => {
    await AsyncStorage.multiSet([
      ['@kalapa_calendar_events', JSON.stringify([sampleEvent])],
      ['@kalapa_calendar_events_backup', JSON.stringify([sampleEvent])],
    ]);

    await clearEvents();

    expect(await AsyncStorage.getItem('@kalapa_calendar_events')).toBeNull();
    expect(await AsyncStorage.getItem('@kalapa_calendar_events_backup')).toBeNull();
  });
});
