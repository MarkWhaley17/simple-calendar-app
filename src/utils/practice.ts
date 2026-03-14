import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '../types';
import { isSessionItem } from './eventEditability';

const PRACTICE_SNAPSHOT_KEY = '@kalapa_practice_running_snapshot';

export type PracticeStage = 'home' | 'timerDetail' | 'intention' | 'running' | 'done';

export interface PracticeRunningSnapshot {
  runningSessionId: string;
  startedAt: string;
  pausedAt?: string;
  accumulatedPausedMs: number;
  targetDurationSec: number;
  selectedDurationSec: number;
  linkedSessionId?: string;
  sessionTitle?: string;
  stage: Extract<PracticeStage, 'running'>;
}

export interface PracticeStats {
  todayMinutes: number;
  sevenDayMinutes: number;
  streakDays: number;
}

export interface TimedPracticeSaveInput {
  sessions: CalendarEvent[];
  startedAt: Date;
  endedAt: Date;
  durationSec: number;
  accumulations?: number;
  linkedSessionId?: string;
  sessionTitle?: string;
}

export interface TimedPracticeSaveResult {
  sessions: CalendarEvent[];
  savedSession: CalendarEvent;
  created: boolean;
}

export const formatDurationMmSs = (durationSec: number): string => {
  const clamped = Math.max(0, Math.floor(durationSec));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatSessionTimeLabel = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const getElapsedSeconds = (
  snapshot: PracticeRunningSnapshot,
  nowMs: number
): number => {
  const startedMs = new Date(snapshot.startedAt).getTime();
  const pausedMs = snapshot.pausedAt ? new Date(snapshot.pausedAt).getTime() : null;
  const effectiveNow = pausedMs ?? nowMs;
  const elapsedMs = Math.max(
    0,
    effectiveNow - startedMs - Math.max(0, snapshot.accumulatedPausedMs)
  );
  return Math.floor(elapsedMs / 1000);
};

export const getRemainingSeconds = (
  snapshot: PracticeRunningSnapshot,
  nowMs: number
): number => {
  const elapsedSec = getElapsedSeconds(snapshot, nowMs);
  return Math.max(0, snapshot.targetDurationSec - elapsedSec);
};

const dateKeyLocal = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const normalizeLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getSessionDurationSeconds = (session: CalendarEvent): number => {
  if (typeof session.durationSeconds === 'number' && session.durationSeconds >= 0) {
    return session.durationSeconds;
  }
  if (!session.fromDate || !session.toDate) return 0;
  const diffSec = Math.floor((session.toDate.getTime() - session.fromDate.getTime()) / 1000);
  return Math.max(0, diffSec);
};

const isTimedPracticeSession = (session: CalendarEvent): boolean =>
  isSessionItem(session) &&
  (session.practiceSource === 'timed-meditation' || typeof session.durationSeconds === 'number');

export const calculatePracticeStats = (sessions: CalendarEvent[], now = new Date()): PracticeStats => {
  const timedSessions = sessions.filter(isTimedPracticeSession);
  const today = normalizeLocalDay(now);
  const sevenDayStart = new Date(today);
  sevenDayStart.setDate(today.getDate() - 6);

  let todaySec = 0;
  let sevenDaySec = 0;

  const completedDayKeys = new Set<string>();

  timedSessions.forEach((session) => {
    const anchorDate = session.toDate || session.fromDate || session.date;
    if (!anchorDate) return;
    const day = normalizeLocalDay(anchorDate);
    const duration = getSessionDurationSeconds(session);
    if (duration <= 0) return;

    if (day.getTime() === today.getTime()) {
      todaySec += duration;
    }
    if (day >= sevenDayStart && day <= today) {
      sevenDaySec += duration;
    }
    completedDayKeys.add(dateKeyLocal(day));
  });

  let streakDays = 0;
  const cursor = new Date(today);
  while (completedDayKeys.has(dateKeyLocal(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    todayMinutes: Math.floor(todaySec / 60),
    sevenDayMinutes: Math.floor(sevenDaySec / 60),
    streakDays,
  };
};

export const getLinkableSessions = (sessions: CalendarEvent[], now = new Date()): CalendarEvent[] => {
  const todayStart = normalizeLocalDay(now);
  return sessions
    .filter((session) => {
      if (!isSessionItem(session)) return false;
      const anchorDate = session.fromDate || session.date;
      if (!anchorDate) return false;
      return normalizeLocalDay(anchorDate) >= todayStart;
    })
    .sort((a, b) => {
      const left = (a.fromDate || a.date || new Date()).getTime();
      const right = (b.fromDate || b.date || new Date()).getTime();
      return left - right;
    });
};

export const applyTimedPracticeSave = (input: TimedPracticeSaveInput): TimedPracticeSaveResult => {
  const {
    sessions,
    startedAt,
    endedAt,
    durationSec,
    accumulations,
    linkedSessionId,
    sessionTitle,
  } = input;

  const nextCoreFields = {
    fromDate: startedAt,
    toDate: endedAt,
    fromTime: formatSessionTimeLabel(startedAt),
    toTime: formatSessionTimeLabel(endedAt),
    durationSeconds: Math.max(0, Math.floor(durationSec)),
    accumulations,
    isAllDay: false,
    practiceSource: 'timed-meditation' as const,
    date: startedAt,
    startTime: formatSessionTimeLabel(startedAt),
    endTime: formatSessionTimeLabel(endedAt),
  };

  if (linkedSessionId) {
    const linked = sessions.find((session) => session.id === linkedSessionId);
    if (linked && isSessionItem(linked)) {
      const updated = {
        ...linked,
        ...nextCoreFields,
      };
      return {
        sessions: sessions.map((session) =>
          session.id === linkedSessionId ? updated : session
        ),
        savedSession: updated,
        created: false,
      };
    }
  }

  const createdSession: CalendarEvent = {
    id: `session-timed-${Date.now()}`,
    title: sessionTitle?.trim() ? sessionTitle.trim() : 'Timed Meditation',
    description: '',
    links: [],
    ...nextCoreFields,
  };

  return {
    sessions: [...sessions, createdSession],
    savedSession: createdSession,
    created: true,
  };
};

export const loadPracticeRunningSnapshot = async (): Promise<PracticeRunningSnapshot | null> => {
  try {
    const value = await AsyncStorage.getItem(PRACTICE_SNAPSHOT_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as PracticeRunningSnapshot;
    if (!parsed?.runningSessionId || !parsed?.startedAt) return null;
    return parsed;
  } catch (error) {
    console.error('Failed to load practice snapshot', error);
    return null;
  }
};

export const savePracticeRunningSnapshot = async (snapshot: PracticeRunningSnapshot): Promise<void> => {
  try {
    await AsyncStorage.setItem(PRACTICE_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Failed to save practice snapshot', error);
  }
};

export const clearPracticeRunningSnapshot = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PRACTICE_SNAPSHOT_KEY);
  } catch (error) {
    console.error('Failed to clear practice snapshot', error);
  }
};
