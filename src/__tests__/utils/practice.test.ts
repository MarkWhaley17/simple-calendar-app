import {
  applyTimedPracticeSave,
  calculatePracticeStats,
  getElapsedSeconds,
  getRemainingSeconds,
  PracticeRunningSnapshot,
} from '../../utils/practice';
import { CalendarEvent } from '../../types';

describe('practice utils', () => {
  it('computes remaining seconds across pause/resume wall-clock intervals', () => {
    const snapshot: PracticeRunningSnapshot = {
      runningSessionId: 'run-1',
      startedAt: '2026-03-14T10:00:00.000Z',
      pausedAt: '2026-03-14T10:02:00.000Z',
      accumulatedPausedMs: 30_000,
      targetDurationSec: 600,
      selectedDurationSec: 600,
      stage: 'running',
    };

    const nowMs = new Date('2026-03-14T10:05:00.000Z').getTime();
    expect(getElapsedSeconds(snapshot, nowMs)).toBe(90);
    expect(getRemainingSeconds(snapshot, nowMs)).toBe(510);
  });

  it('calculates today, seven-day totals and streak from timed sessions', () => {
    const sessions: CalendarEvent[] = [
      {
        id: 's1',
        title: 'Timed Meditation Session',
        fromDate: new Date('2026-03-14T09:00:00'),
        toDate: new Date('2026-03-14T09:20:00'),
        durationSeconds: 1200,
        practiceSource: 'timed-meditation',
      },
      {
        id: 's2',
        title: 'Timed Meditation Session',
        fromDate: new Date('2026-03-13T09:00:00'),
        toDate: new Date('2026-03-13T09:10:00'),
        durationSeconds: 600,
        practiceSource: 'timed-meditation',
      },
      {
        id: 's3',
        title: 'Timed Meditation Session',
        fromDate: new Date('2026-03-12T09:00:00'),
        toDate: new Date('2026-03-12T09:15:00'),
        durationSeconds: 900,
        practiceSource: 'timed-meditation',
      },
    ];

    const stats = calculatePracticeStats(sessions, new Date('2026-03-14T16:00:00'));
    expect(stats.todayMinutes).toBe(20);
    expect(stats.sevenDayMinutes).toBe(45);
    expect(stats.streakDays).toBe(3);
  });

  it('updates linked session instead of creating new session', () => {
    const sessions: CalendarEvent[] = [
      {
        id: 'session-1',
        title: 'Morning Sit',
        fromDate: new Date('2026-03-14T08:00:00'),
      },
    ];

    const result = applyTimedPracticeSave({
      sessions,
      linkedSessionId: 'session-1',
      startedAt: new Date('2026-03-14T08:10:00'),
      endedAt: new Date('2026-03-14T08:40:00'),
      durationSec: 1800,
      accumulations: 2,
    });

    expect(result.created).toBe(false);
    expect(result.sessions).toHaveLength(1);
    expect(result.savedSession.id).toBe('session-1');
    expect(result.savedSession.durationSeconds).toBe(1800);
    expect(result.savedSession.accumulations).toBe(2);
  });

  it('creates a new timed meditation session when no link is selected', () => {
    const result = applyTimedPracticeSave({
      sessions: [],
      startedAt: new Date('2026-03-14T08:10:00'),
      endedAt: new Date('2026-03-14T08:40:00'),
      durationSec: 1800,
    });

    expect(result.created).toBe(true);
    expect(result.sessions).toHaveLength(1);
    expect(result.savedSession.title).toBe('Timed Meditation Session');
    expect(result.savedSession.practiceSource).toBe('timed-meditation');
  });
});
