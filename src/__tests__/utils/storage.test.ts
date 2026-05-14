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

  it('saves using a versioned envelope and keeps previous main as backup', async () => {
    await AsyncStorage.setItem(
      '@kalapa_calendar_events',
      JSON.stringify([{ ...sampleEvent, title: 'Older Session' }])
    );

    await saveEvents([sampleEvent]);

    const mainRaw = await AsyncStorage.getItem('@kalapa_calendar_events');
    const backupRaw = await AsyncStorage.getItem('@kalapa_calendar_events_backup');
    const tempRaw = await AsyncStorage.getItem('@kalapa_calendar_events_tmp');
    expect(mainRaw).not.toBeNull();
    expect(backupRaw).not.toBeNull();
    expect(tempRaw).toBeNull();

    const mainParsed = JSON.parse(mainRaw as string);
    expect(mainParsed.version).toBe(1);
    expect(Array.isArray(mainParsed.events)).toBe(true);
    expect(mainParsed.events[0].id).toBe('session-1');
  });

  it('loads hydrated events from main storage envelope', async () => {
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
      JSON.stringify({
        version: 1,
        savedAt: '2026-03-15T00:00:00.000Z',
        events: [sampleEvent],
      })
    );

    const loaded = await loadEvents();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('session-1');
    const repairedMain = await AsyncStorage.getItem('@kalapa_calendar_events');
    expect(repairedMain).toBe(await AsyncStorage.getItem('@kalapa_calendar_events_backup'));
  });

  it('loads legacy array format for backward compatibility', async () => {
    await AsyncStorage.setItem(
      '@kalapa_calendar_events',
      JSON.stringify([sampleEvent])
    );

    const loaded = await loadEvents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('session-1');
    expect(loaded[0].fromDate).toBeInstanceOf(Date);
  });

  it('clears main, backup, and temp keys', async () => {
    await AsyncStorage.multiSet([
      ['@kalapa_calendar_events', JSON.stringify({ version: 1, events: [sampleEvent] })],
      ['@kalapa_calendar_events_backup', JSON.stringify({ version: 1, events: [sampleEvent] })],
      ['@kalapa_calendar_events_tmp', JSON.stringify({ version: 1, events: [sampleEvent] })],
    ]);

    await clearEvents();

    expect(await AsyncStorage.getItem('@kalapa_calendar_events')).toBeNull();
    expect(await AsyncStorage.getItem('@kalapa_calendar_events_backup')).toBeNull();
    expect(await AsyncStorage.getItem('@kalapa_calendar_events_tmp')).toBeNull();
  });
});
