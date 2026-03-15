import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent } from '../../types';
import {
  PRACTICE_DEDICATION_TEXT,
  PRACTICE_DURATION_PRESETS_MINUTES,
  PRACTICE_INTENTION_TEXT,
  PRACTICE_MANTRA_LIBRARY,
  PRACTICE_MANTRA_TARGET_OPTIONS,
  formatMantraTargetLabel,
} from '../../constants/practice';
import {
  PracticeMantraSnapshot,
  PracticeRunningSnapshot,
  PracticeStage,
  PracticeStats,
  TimedPracticeSaveInput,
  calculatePracticeStats,
  clearPracticeMantraSnapshot,
  clearPracticeRunningSnapshot,
  formatDurationMmSs,
  getElapsedSeconds,
  getLinkableSessions,
  getRemainingSeconds,
  loadPracticeMantraSnapshot,
  loadPracticeRunningSnapshot,
  savePracticeMantraSnapshot,
  savePracticeRunningSnapshot,
} from '../../utils/practice';
import { playPracticeCompletionFeedback, playPracticeGong } from '../../utils/practiceCompletion';
import { colors, spacing } from '../../theme/tokens';

const headerBackground = require('../../../assets/day-bg.jpg');
const detailBackground = require('../../../assets/day-view-pattern.png');
const DEFAULT_TIMED_SESSION_TITLE = 'Timed Meditation';
const SESSION_TITLE_PLACEHOLDER = 'Add a Session Title (optional)';
const DEFAULT_MANTRA_SESSION_TITLE = 'Mantra Session';

interface PracticeViewProps {
  sessions: CalendarEvent[];
  onSaveTimedSession: (input: Omit<TimedPracticeSaveInput, 'sessions'>) => Promise<void>;
  onRunningStateChange?: (isRunning: boolean) => void;
}

interface MantraInProgressState {
  mantraId: string;
  mantraTitle: string;
  target: number;
  done: number;
  elapsedSec: number;
  linkedSessionId?: string;
  sessionTitle?: string;
}

const screenWidth = Dimensions.get('window').width;
const COUNTDOWN_RING_SIZE = 200;
const COUNTDOWN_RING_SEGMENTS = 72;
const COUNTDOWN_RING_RADIUS = 88;
const COUNTDOWN_SEGMENT_WIDTH = 2;
const COUNTDOWN_SEGMENT_HEIGHT = 8;
const DEDICATION_CELEBRATION_DURATION_MS = 1600;
const SHOULD_WAIT_FOR_CELEBRATION = process.env.NODE_ENV !== 'test';
const DEDICATION_CONFETTI_PIECES = [
  { id: 'confetti-1', xStart: -18, xEnd: -220, yEnd: 260, rotation: -170, color: '#F97316' },
  { id: 'confetti-2', xStart: 20, xEnd: -170, yEnd: 300, rotation: -210, color: '#FACC15' },
  { id: 'confetti-3', xStart: -12, xEnd: -112, yEnd: 272, rotation: -150, color: '#22C55E' },
  { id: 'confetti-4', xStart: 14, xEnd: -54, yEnd: 332, rotation: -120, color: '#14B8A6' },
  { id: 'confetti-5', xStart: -10, xEnd: 32, yEnd: 286, rotation: 130, color: '#0EA5E9' },
  { id: 'confetti-6', xStart: 12, xEnd: 88, yEnd: 324, rotation: 170, color: '#3B82F6' },
  { id: 'confetti-7', xStart: -8, xEnd: 132, yEnd: 274, rotation: 160, color: '#6366F1' },
  { id: 'confetti-8', xStart: 16, xEnd: 188, yEnd: 302, rotation: 205, color: '#EC4899' },
  { id: 'confetti-9', xStart: -14, xEnd: 216, yEnd: 260, rotation: 225, color: '#EF4444' },
  { id: 'confetti-10', xStart: 10, xEnd: -190, yEnd: 244, rotation: -230, color: '#FB7185' },
  { id: 'confetti-11', xStart: -20, xEnd: 76, yEnd: 252, rotation: 180, color: '#A855F7' },
  { id: 'confetti-12', xStart: 18, xEnd: -82, yEnd: 248, rotation: -180, color: '#F59E0B' },
] as const;

const PracticeCountdownRing: React.FC<{ progress: number }> = ({ progress }) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const activeCount = Math.floor(COUNTDOWN_RING_SEGMENTS * clampedProgress);
  const centerX = COUNTDOWN_RING_SIZE / 2;
  const centerY = COUNTDOWN_RING_SIZE / 2;
  const segmentAngle = 360 / COUNTDOWN_RING_SEGMENTS;
  const removedCount = COUNTDOWN_RING_SEGMENTS - activeCount;
  const ringSegments = Array.from({ length: COUNTDOWN_RING_SEGMENTS }, (_, index) => {
    // Depletion starts at 12 o'clock and proceeds counterclockwise (to the left).
    const isActive = index >= removedCount;
    const angleDeg = -90 - index * segmentAngle;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = centerX + COUNTDOWN_RING_RADIUS * Math.cos(angleRad) - COUNTDOWN_SEGMENT_WIDTH / 2;
    const y = centerY + COUNTDOWN_RING_RADIUS * Math.sin(angleRad) - COUNTDOWN_SEGMENT_HEIGHT / 2;
    return (
      <View
        key={`ring-segment-${index}`}
        style={[
          styles.countdownRingSegment,
          {
            left: x,
            top: y,
            opacity: isActive ? 1 : 0.18,
            transform: [{ rotate: `${angleDeg}deg` }],
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.countdownRing} testID="practice-countdown-ring">
      {ringSegments}
      <View style={styles.countdownSun} />
    </View>
  );
};

const PracticeView: React.FC<PracticeViewProps> = ({
  sessions,
  onSaveTimedSession,
  onRunningStateChange,
}) => {
  const slideX = useRef(new Animated.Value(0)).current;
  const dedicationCelebrationProgress = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);
  const detailScrollRef = useRef<ScrollView | null>(null);
  const [stage, setStage] = useState<PracticeStage>('home');
  const [selectedDurationSec, setSelectedDurationSec] = useState(10 * 60);
  const [runningSnapshot, setRunningSnapshot] = useState<PracticeRunningSnapshot | null>(null);
  const [remainingSec, setRemainingSec] = useState(selectedDurationSec);
  const [linkedSessionId, setLinkedSessionId] = useState<string | undefined>(undefined);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [showAccumulationsModal, setShowAccumulationsModal] = useState(false);
  const [accumulationsInput, setAccumulationsInput] = useState('');
  const [dedicationAccumulations, setDedicationAccumulations] = useState<number | undefined>(undefined);
  const [sessionTitleInput, setSessionTitleInput] = useState('');
  const [hasTouchedSessionTitle, setHasTouchedSessionTitle] = useState(false);
  const [completedDurationSec, setCompletedDurationSec] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [sessionEndedAt, setSessionEndedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dedicationConfettiOriginY, setDedicationConfettiOriginY] = useState(440);
  const [expandedMantraId, setExpandedMantraId] = useState<string | null>(null);
  const [selectedMantraId, setSelectedMantraId] = useState<string | null>(null);
  const [selectedMantraTarget, setSelectedMantraTarget] = useState<number>(108);
  const [mantraCount, setMantraCount] = useState(0);
  const [showCustomTargetModal, setShowCustomTargetModal] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('');
  const [mantraLinkedSessionId, setMantraLinkedSessionId] = useState<string | undefined>(undefined);
  const [showMantraLinkPicker, setShowMantraLinkPicker] = useState(false);
  const [mantraSessionTitleInput, setMantraSessionTitleInput] = useState('');
  const [hasTouchedMantraSessionTitle, setHasTouchedMantraSessionTitle] = useState(false);
  const [mantraElapsedSec, setMantraElapsedSec] = useState(0);
  const [saveLinkedSessionId, setSaveLinkedSessionId] = useState<string | undefined>(undefined);
  const [saveSessionTitle, setSaveSessionTitle] = useState(DEFAULT_TIMED_SESSION_TITLE);
  const [completedPracticeMode, setCompletedPracticeMode] = useState<'timed' | 'mantra' | null>(null);
  const [mantraInProgress, setMantraInProgress] = useState<MantraInProgressState | null>(null);
  const [mantraResumeDraft, setMantraResumeDraft] = useState<MantraInProgressState | null>(null);
  const hasHydratedSnapshotsRef = useRef(false);

  const stats: PracticeStats = useMemo(() => calculatePracticeStats(sessions), [sessions]);
  const linkableSessions = useMemo(() => getLinkableSessions(sessions), [sessions]);
  const linkedSession = useMemo(
    () => linkableSessions.find((session) => session.id === linkedSessionId),
    [linkableSessions, linkedSessionId]
  );
  const selectedMantra = useMemo(
    () => PRACTICE_MANTRA_LIBRARY.find((mantra) => mantra.id === selectedMantraId) ?? null,
    [selectedMantraId]
  );
  const mantraLinkedSession = useMemo(
    () => linkableSessions.find((session) => session.id === mantraLinkedSessionId),
    [linkableSessions, mantraLinkedSessionId]
  );

  const openTimerDetail = () => {
    if (runningSnapshot) {
      setRemainingSec(getRemainingSeconds(runningSnapshot, Date.now()));
      setStage('running');
    } else {
      setStage('timerDetail');
    }
    Animated.timing(slideX, {
      toValue: -screenWidth,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };

  const openMantraLibrary = () => {
    setExpandedMantraId(null);
    setSelectedMantraId(null);
    setSelectedMantraTarget(108);
    setMantraCount(0);
    setShowMantraLinkPicker(false);
    setMantraLinkedSessionId(undefined);
    setMantraSessionTitleInput('');
    setHasTouchedMantraSessionTitle(false);
    setMantraElapsedSec(0);
    setMantraResumeDraft(null);
    setShowCustomTargetModal(false);
    setCustomTargetInput('');
    setStage('mantraLibrary');
    Animated.timing(slideX, {
      toValue: -screenWidth,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };

  const returnHome = () => {
    setShowLinkPicker(false);
    setStage('home');
    Animated.timing(slideX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleDetailBack = () => {
    if (stage === 'mantraSetup') {
      setStage('mantraLibrary');
      return;
    }
    if (stage === 'mantraIntention') {
      setStage('mantraSetup');
      return;
    }
    if (stage === 'mantraRunning') {
      if (selectedMantra) {
        setMantraInProgress((current) => {
          if (!current || current.mantraId !== selectedMantra.id) return current;
          return {
            ...current,
            done: mantraCount,
            elapsedSec: mantraElapsedSec,
          };
        });
      }
      setStage('mantraLibrary');
      return;
    }
    returnHome();
  };

  const startFreshMantraSetup = (mantraId: string) => {
    setMantraInProgress((current) => (current?.mantraId === mantraId ? null : current));
    setSelectedMantraId(mantraId);
    setSelectedMantraTarget(108);
    setMantraCount(0);
    setMantraResumeDraft(null);
    setStage('mantraSetup');
  };

  const resumeMantraInProgress = (inProgress: MantraInProgressState) => {
    setSelectedMantraId(inProgress.mantraId);
    setSelectedMantraTarget(inProgress.target);
    setMantraCount(inProgress.done);
    setMantraLinkedSessionId(inProgress.linkedSessionId);
    setShowMantraLinkPicker(false);
    setMantraSessionTitleInput(inProgress.sessionTitle || '');
    setHasTouchedMantraSessionTitle(Boolean(inProgress.sessionTitle?.trim()));
    setMantraElapsedSec(inProgress.elapsedSec);
    setMantraResumeDraft(inProgress);
    setStage('mantraIntention');
  };

  const handleAdjustMinutes = (deltaMinutes: number) => {
    setSelectedDurationSec((prev) => Math.max(60, prev + deltaMinutes * 60));
  };

  const persistSnapshot = async (snapshot: PracticeRunningSnapshot | null) => {
    if (snapshot) {
      await savePracticeRunningSnapshot(snapshot);
      return;
    }
    await clearPracticeRunningSnapshot();
  };

  const persistMantraSnapshot = async (snapshot: PracticeMantraSnapshot | null) => {
    if (snapshot) {
      await savePracticeMantraSnapshot(snapshot);
      return;
    }
    await clearPracticeMantraSnapshot();
  };

  useEffect(() => {
    Promise.all([
      loadPracticeRunningSnapshot(),
      loadPracticeMantraSnapshot(),
    ]).then(([timedSnapshot, mantraSnapshot]) => {
      if (timedSnapshot) {
        setSelectedDurationSec(timedSnapshot.selectedDurationSec);
        setLinkedSessionId(timedSnapshot.linkedSessionId);
        setSessionTitleInput(timedSnapshot.sessionTitle || '');
        setHasTouchedSessionTitle(Boolean(timedSnapshot.sessionTitle?.trim()));
        setRunningSnapshot(timedSnapshot);
        setStage('running');
        setRemainingSec(getRemainingSeconds(timedSnapshot, Date.now()));
        slideX.setValue(-screenWidth);
        return;
      }

      if (!mantraSnapshot) return;

      const restoredInProgress: MantraInProgressState = {
        mantraId: mantraSnapshot.mantraId,
        mantraTitle: mantraSnapshot.mantraTitle,
        target: mantraSnapshot.target,
        done: mantraSnapshot.done,
        elapsedSec: mantraSnapshot.elapsedSec,
        linkedSessionId: mantraSnapshot.linkedSessionId,
        sessionTitle: mantraSnapshot.sessionTitle,
      };

      setMantraInProgress(restoredInProgress);

      if (!mantraSnapshot.isRunning) {
        return;
      }

      const mantraExists = PRACTICE_MANTRA_LIBRARY.some(
        (mantra) => mantra.id === mantraSnapshot.mantraId
      );
      if (!mantraExists) {
        return;
      }

      const restoredStartedAt = mantraSnapshot.startedAt
        ? new Date(mantraSnapshot.startedAt)
        : new Date(Date.now() - mantraSnapshot.elapsedSec * 1000);
      const restoredElapsed = Math.max(
        0,
        Math.floor((Date.now() - restoredStartedAt.getTime()) / 1000)
      );

      setSelectedMantraId(mantraSnapshot.mantraId);
      setSelectedMantraTarget(mantraSnapshot.target);
      setMantraCount(mantraSnapshot.done);
      setMantraLinkedSessionId(mantraSnapshot.linkedSessionId);
      setShowMantraLinkPicker(false);
      setMantraSessionTitleInput(mantraSnapshot.sessionTitle || '');
      setHasTouchedMantraSessionTitle(Boolean(mantraSnapshot.sessionTitle?.trim()));
      setSessionStartedAt(restoredStartedAt);
      setSessionEndedAt(null);
      setCompletedDurationSec(0);
      setMantraElapsedSec(restoredElapsed);
      setMantraResumeDraft(null);
      setStage('mantraRunning');
      slideX.setValue(-screenWidth);
    }).finally(() => {
      hasHydratedSnapshotsRef.current = true;
    });
  }, [slideX]);

  useEffect(() => {
    if (!hasHydratedSnapshotsRef.current && !runningSnapshot) return;
    void persistSnapshot(runningSnapshot);
  }, [runningSnapshot]);

  useEffect(() => {
    const hasMantraState =
      Boolean(mantraInProgress) ||
      (stage === 'mantraRunning' && Boolean(selectedMantra) && Boolean(sessionStartedAt));
    if (!hasHydratedSnapshotsRef.current && !hasMantraState) return;

    const isMantraRunning =
      stage === 'mantraRunning' &&
      Boolean(selectedMantra) &&
      Boolean(sessionStartedAt);

    if (isMantraRunning && selectedMantra && sessionStartedAt) {
      void persistMantraSnapshot({
        mantraId: selectedMantra.id,
        mantraTitle: selectedMantra.title,
        target: selectedMantraTarget,
        done: mantraCount,
        elapsedSec: Math.max(
          mantraElapsedSec,
          Math.floor((Date.now() - sessionStartedAt.getTime()) / 1000)
        ),
        linkedSessionId: mantraLinkedSessionId,
        sessionTitle: hasTouchedMantraSessionTitle ? mantraSessionTitleInput.trim() : undefined,
        isRunning: true,
        startedAt: sessionStartedAt.toISOString(),
      });
      return;
    }

    if (mantraInProgress && mantraInProgress.done < mantraInProgress.target) {
      void persistMantraSnapshot({
        ...mantraInProgress,
        isRunning: false,
      });
      return;
    }

    void persistMantraSnapshot(null);
  }, [
    stage,
    selectedMantra,
    selectedMantraTarget,
    mantraCount,
    mantraElapsedSec,
    mantraLinkedSessionId,
    hasTouchedMantraSessionTitle,
    mantraSessionTitleInput,
    mantraInProgress,
    sessionStartedAt,
  ]);

  useEffect(() => {
    const isRunning =
      Boolean(runningSnapshot) ||
      (stage === 'mantraRunning' && Boolean(selectedMantra) && Boolean(sessionStartedAt));
    onRunningStateChange?.(isRunning);
  }, [runningSnapshot, stage, selectedMantra, sessionStartedAt, onRunningStateChange]);

  useEffect(() => {
    if (!runningSnapshot || stage !== 'running') return;

    const tick = () => {
      const nowMs = Date.now();
      const nextRemaining = getRemainingSeconds(runningSnapshot, nowMs);
      setRemainingSec(nextRemaining);
      if (nextRemaining <= 0) {
        completeRunningSession(true);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [runningSnapshot, stage]);

  useEffect(() => {
    if (stage !== 'mantraRunning' || !sessionStartedAt) return;
    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartedAt.getTime()) / 1000));
      setMantraElapsedSec(elapsed);
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [stage, sessionStartedAt]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      dedicationCelebrationProgress.stopAnimation();
    };
  }, [dedicationCelebrationProgress]);

  const triggerDedicationCelebration = () => {
    dedicationCelebrationProgress.stopAnimation();
    dedicationCelebrationProgress.setValue(0);
    return new Promise<void>((resolve) => {
      Animated.timing(dedicationCelebrationProgress, {
        toValue: 1,
        duration: DEDICATION_CELEBRATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        dedicationCelebrationProgress.setValue(0);
        resolve();
      });
    });
  };

  useEffect(() => {
    if (stage !== 'done') return;
    dedicationCelebrationProgress.stopAnimation();
    dedicationCelebrationProgress.setValue(0);
  }, [dedicationCelebrationProgress, stage]);

  const beginCountdown = () => {
    const now = new Date();
    const snapshot: PracticeRunningSnapshot = {
      runningSessionId: `practice-${now.getTime()}`,
      startedAt: now.toISOString(),
      accumulatedPausedMs: 0,
      targetDurationSec: selectedDurationSec,
      selectedDurationSec,
      linkedSessionId,
      sessionTitle: hasTouchedSessionTitle ? sessionTitleInput.trim() : undefined,
      stage: 'running',
    };
    setSessionStartedAt(now);
    setSessionEndedAt(null);
    setCompletedDurationSec(0);
    setRunningSnapshot(snapshot);
    setRemainingSec(selectedDurationSec);
    setStage('running');
    void playPracticeGong();
  };

  const togglePauseResume = () => {
    if (!runningSnapshot) return;
    const now = new Date();
    if (!runningSnapshot.pausedAt) {
      setRunningSnapshot({
        ...runningSnapshot,
        pausedAt: now.toISOString(),
      });
      return;
    }

    const pausedAtMs = new Date(runningSnapshot.pausedAt).getTime();
    const resumedAtMs = now.getTime();
    setRunningSnapshot({
      ...runningSnapshot,
      pausedAt: undefined,
      accumulatedPausedMs:
        runningSnapshot.accumulatedPausedMs + Math.max(0, resumedAtMs - pausedAtMs),
    });
  };

  const completeRunningSession = (_fromCountdownCompletion = false) => {
    if (!runningSnapshot) return;
    const endedAt = new Date();
    const startedAt = new Date(runningSnapshot.startedAt);
    const elapsedSec = runningSnapshot.targetDurationSec - getRemainingSeconds(runningSnapshot, endedAt.getTime());
    const safeDuration = Math.max(0, elapsedSec);

    setCompletedDurationSec(safeDuration);
    setSessionStartedAt(startedAt);
    setSessionEndedAt(endedAt);
    setSaveLinkedSessionId(linkedSessionId);
    setSaveSessionTitle(
      linkedSessionId
        ? DEFAULT_TIMED_SESSION_TITLE
        : (hasTouchedSessionTitle ? sessionTitleInput.trim() : DEFAULT_TIMED_SESSION_TITLE)
    );
    setDedicationAccumulations(linkedSession?.accumulations);
    setCompletedPracticeMode('timed');
    setRunningSnapshot(null);
    setStage('done');
    void playPracticeCompletionFeedback();
  };

  const completeMantraSession = () => {
    if (!sessionStartedAt) return;
    const endedAt = new Date();
    const durationSec = Math.max(0, Math.floor((endedAt.getTime() - sessionStartedAt.getTime()) / 1000));
    const fallbackTitle = selectedMantra ? `${selectedMantra.title} Session` : DEFAULT_MANTRA_SESSION_TITLE;
    const resolvedTitle = mantraLinkedSessionId
      ? fallbackTitle
      : (hasTouchedMantraSessionTitle ? mantraSessionTitleInput.trim() : fallbackTitle);

    setCompletedDurationSec(durationSec);
    setSessionEndedAt(endedAt);
    setSaveLinkedSessionId(mantraLinkedSessionId);
    setSaveSessionTitle(resolvedTitle || fallbackTitle);
    setDedicationAccumulations(
      mantraLinkedSession?.accumulations !== undefined
        ? mantraLinkedSession.accumulations
        : mantraCount
    );
    setCompletedPracticeMode('mantra');
    setMantraInProgress((current) => {
      if (!selectedMantra) return current;
      const done = mantraCount;
      if (done >= selectedMantraTarget) {
        return null;
      }
      return {
        mantraId: selectedMantra.id,
        mantraTitle: selectedMantra.title,
        target: selectedMantraTarget,
        done,
        elapsedSec: durationSec,
        linkedSessionId: mantraLinkedSessionId,
        sessionTitle: hasTouchedMantraSessionTitle ? mantraSessionTitleInput.trim() : undefined,
      };
    });
    setStage('done');
    void playPracticeCompletionFeedback();
  };

  const resetAfterSave = () => {
    setShowAccumulationsModal(false);
    setAccumulationsInput('');
    setDedicationAccumulations(undefined);
    setCompletedDurationSec(0);
    setSessionStartedAt(null);
    setSessionEndedAt(null);
    setLinkedSessionId(undefined);
    setSessionTitleInput('');
    setHasTouchedSessionTitle(false);
    setMantraSessionTitleInput('');
    setHasTouchedMantraSessionTitle(false);
    setMantraLinkedSessionId(undefined);
    setShowMantraLinkPicker(false);
    setMantraElapsedSec(0);
    setMantraResumeDraft(null);
    setShowCustomTargetModal(false);
    setCustomTargetInput('');
    setSaveLinkedSessionId(undefined);
    setSaveSessionTitle(DEFAULT_TIMED_SESSION_TITLE);
    setCompletedPracticeMode(null);
    setShowLinkPicker(false);
    returnHome();
  };

  const openAccumulationsEditor = () => {
    setAccumulationsInput('');
    setShowAccumulationsModal(true);
  };

  const applyAccumulationsEdit = () => {
    const trimmed = accumulationsInput.trim();
    if (!trimmed) {
      setShowAccumulationsModal(false);
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      Alert.alert('Invalid Accumulations', 'Accumulations must be a non-negative integer.');
      return;
    }
    setDedicationAccumulations(Number(trimmed));
    setShowAccumulationsModal(false);
  };

  const submitSessionSave = async () => {
    if (!sessionStartedAt || !sessionEndedAt || isSaving) return;

    setIsSaving(true);
    const celebrationPromise = triggerDedicationCelebration();
    try {
      await onSaveTimedSession({
        startedAt: sessionStartedAt,
        endedAt: sessionEndedAt,
        durationSec: completedDurationSec,
        linkedSessionId: saveLinkedSessionId,
        sessionTitle: saveLinkedSessionId
          ? undefined
          : (saveSessionTitle.trim() || DEFAULT_TIMED_SESSION_TITLE),
        practiceSource: completedPracticeMode === 'mantra' ? 'mantra-counter' : 'timed-meditation',
        accumulations: dedicationAccumulations,
      });
      if (SHOULD_WAIT_FOR_CELEBRATION) {
        await celebrationPromise;
      }
      if (!isMountedRef.current) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      resetAfterSave();
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const applyCustomMantraTarget = () => {
    const trimmed = customTargetInput.trim();
    if (!/^\d+$/.test(trimmed)) {
      Alert.alert('Invalid Target Count', 'Please enter a non-negative whole number.');
      return;
    }
    setSelectedMantraTarget(Number(trimmed));
    setShowCustomTargetModal(false);
    setCustomTargetInput('');
  };

  const renderDetailContent = () => {
    if (stage === 'mantraLibrary') {
      return (
        <ScrollView contentContainerStyle={styles.detailPanel}>
          <Text style={styles.selectDurationTitle}>Mantra Library</Text>
          <View style={styles.mantraLibraryList}>
            {PRACTICE_MANTRA_LIBRARY.map((mantra) => {
              const isExpanded = expandedMantraId === mantra.id;
              return (
                <TouchableOpacity
                  key={mantra.id}
                  style={styles.mantraCard}
                  activeOpacity={0.9}
                  onPress={() => setExpandedMantraId(isExpanded ? null : mantra.id)}
                  testID={`practice-mantra-card-${mantra.id}`}
                >
                  <View style={styles.mantraCardHeader}>
                    <View style={styles.mantraCardHeaderText}>
                      <Text style={styles.mantraCardTitle}>{mantra.title}</Text>
                      <Text style={styles.mantraCardMantra}>{mantra.mantra}</Text>
                    </View>
                    <Text style={styles.mantraCardChevron}>{isExpanded ? '⌃' : '⌄'}</Text>
                  </View>
                  {isExpanded ? (
                    <View style={styles.mantraCardExpanded}>
                      <Text style={styles.mantraCardDescription}>{mantra.description}</Text>
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => {
                          const hasInProgress =
                            mantraInProgress &&
                            mantraInProgress.mantraId === mantra.id &&
                            mantraInProgress.done < mantraInProgress.target;

                          if (hasInProgress) {
                            Alert.alert(
                              'Session In Progress',
                              `Are you sure you want to start a fresh ${mantra.title} session? This will overwrite your progress towards your existing goal.`,
                              [
                                {
                                  text: 'Resume Existing',
                                  onPress: () => resumeMantraInProgress(mantraInProgress),
                                },
                                {
                                  text: 'Start Fresh',
                                  style: 'destructive',
                                  onPress: () => startFreshMantraSetup(mantra.id),
                                },
                                {
                                  text: 'Cancel',
                                  style: 'cancel',
                                },
                              ]
                            );
                            return;
                          }
                          startFreshMantraSetup(mantra.id);
                        }}
                        testID={`practice-mantra-add-${mantra.id}`}
                      >
                        <Text style={styles.primaryButtonText}>Select Mantra</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  {mantraInProgress &&
                  mantraInProgress.mantraId === mantra.id &&
                  mantraInProgress.done < mantraInProgress.target ? (
                    <TouchableOpacity
                      style={styles.mantraInProgressRow}
                      onPress={() => resumeMantraInProgress(mantraInProgress)}
                      testID={`practice-mantra-in-progress-${mantra.id}`}
                    >
                      <View style={styles.mantraInProgressTextWrap}>
                        <Text style={styles.mantraInProgressTitle}>
                          {`In Progress ${mantraInProgress.mantraTitle} Mantra`}
                        </Text>
                        <Text style={styles.mantraInProgressMeta}>
                          {`Target: ${formatMantraTargetLabel(mantraInProgress.target)}, Done: ${mantraInProgress.done}`}
                        </Text>
                      </View>
                      <Text style={styles.mantraInProgressChevron}>›</Text>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      );
    }

    if (stage === 'mantraSetup' && selectedMantra) {
      return (
        <ScrollView
          ref={detailScrollRef}
          contentContainerStyle={styles.detailPanel}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <Text style={styles.selectDurationTitle}>{selectedMantra.title}</Text>
          <View style={styles.intentionCard}>
            <Text style={styles.sectionLabel}>Mantra</Text>
            <Text style={styles.intentionText}>{selectedMantra.mantra}</Text>
            <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>Description</Text>
            <Text style={styles.intentionText}>{selectedMantra.description}</Text>
          </View>
          <Text style={styles.sectionLabel}>Target Count</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.targetPillsWrap}
            testID="practice-mantra-target-strip"
          >
            {PRACTICE_MANTRA_TARGET_OPTIONS.map((target) => {
              const isSelected = selectedMantraTarget === target;
              return (
                <TouchableOpacity
                  key={target}
                  style={[styles.targetPill, isSelected && styles.minutePillSelected]}
                  onPress={() => setSelectedMantraTarget(target)}
                  testID={`practice-mantra-target-${target}`}
                >
                  <Text style={[styles.minutePillText, isSelected && styles.minutePillTextSelected]}>
                    {formatMantraTargetLabel(target)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.targetPill}
              onPress={() => setShowCustomTargetModal(true)}
              testID="practice-mantra-target-custom"
            >
              <Text style={styles.minutePillText}>Custom</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setShowMantraLinkPicker((prev) => !prev)}
            testID="practice-mantra-link-toggle"
          >
            <Text style={styles.linkButtonText}>
              {mantraLinkedSession
                ? `Linked: ${mantraLinkedSession.title}`
                : 'Link Calendar Session (optional)'}
            </Text>
          </TouchableOpacity>
          {showMantraLinkPicker ? (
            <View style={styles.linkList}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => {
                  setMantraLinkedSessionId(undefined);
                  setShowMantraLinkPicker(false);
                }}
                testID="practice-mantra-link-none"
              >
                <Text style={styles.linkRowText}>No linked session</Text>
              </TouchableOpacity>
              {linkableSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.linkRow}
                  onPress={() => {
                    setMantraLinkedSessionId(session.id);
                    setShowMantraLinkPicker(false);
                  }}
                  testID={`practice-mantra-link-${session.id}`}
                >
                  <Text style={styles.linkRowText}>{session.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {!mantraLinkedSessionId ? (
            <TextInput
              style={styles.sessionTitleInput}
              value={mantraSessionTitleInput}
              onChangeText={(text) => {
                setHasTouchedMantraSessionTitle(true);
                setMantraSessionTitleInput(text);
              }}
              onFocus={() => {
                setHasTouchedMantraSessionTitle(true);
                setTimeout(() => {
                  detailScrollRef.current?.scrollToEnd({ animated: true });
                }, 120);
              }}
              placeholder={SESSION_TITLE_PLACEHOLDER}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="sentences"
              autoCorrect={false}
              returnKeyType="done"
              testID="practice-mantra-session-title-input"
            />
          ) : null}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStage('mantraIntention')}
            testID="practice-mantra-set-intention"
          >
            <Text style={styles.primaryButtonText}>Set Intention</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (stage === 'mantraIntention') {
      return (
        <View style={styles.detailPanel}>
          <Text style={styles.selectDurationTitle}>Set Intention</Text>
          <View style={styles.intentionCard}>
            <Text style={styles.intentionText}>{PRACTICE_INTENTION_TEXT}</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setMantraCount(0);
              const resumeElapsed = mantraResumeDraft?.elapsedSec ?? 0;
              const resumeDone = mantraResumeDraft?.done ?? 0;
              const now = new Date();
              const startedAt = new Date(now.getTime() - resumeElapsed * 1000);
              setSessionStartedAt(startedAt);
              setSessionEndedAt(null);
              setCompletedDurationSec(0);
              setMantraCount(resumeDone);
              setMantraElapsedSec(resumeElapsed);
              if (!mantraResumeDraft && selectedMantra) {
                setMantraInProgress({
                  mantraId: selectedMantra.id,
                  mantraTitle: selectedMantra.title,
                  target: selectedMantraTarget,
                  done: 0,
                  elapsedSec: 0,
                  linkedSessionId: mantraLinkedSessionId,
                  sessionTitle: hasTouchedMantraSessionTitle ? mantraSessionTitleInput.trim() : undefined,
                });
              }
              setMantraResumeDraft(null);
              setStage('mantraRunning');
              void playPracticeGong();
            }}
            testID="practice-mantra-start"
          >
            <Text style={styles.primaryButtonText}>Start Practice</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (stage === 'mantraRunning' && selectedMantra) {
      return (
        <View style={[styles.detailPanel, styles.runningDetailPanel]}>
          <Text style={styles.selectDurationTitle}>{selectedMantra.title}</Text>
          <Text style={styles.mantraCounterSubtitle}>{selectedMantra.mantra}</Text>
          <View style={styles.mantraCounterWrap}>
            <TouchableOpacity
              style={styles.mantraCounterButton}
              onPress={() => {
                setMantraCount((prev) => {
                  const next = prev + 1;
                  setMantraInProgress((current) => {
                    if (!current || !selectedMantra) return current;
                    if (current.mantraId !== selectedMantra.id) return current;
                    return {
                      ...current,
                      done: next,
                      elapsedSec: mantraElapsedSec,
                    };
                  });
                  return next;
                });
                void Haptics.selectionAsync();
              }}
              testID="practice-mantra-counter-button"
            >
              <Text style={styles.mantraCounterValue} testID="practice-mantra-counter-value">
                {mantraCount}
              </Text>
              <Text style={styles.mantraCounterHint}>Tap to count</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mantraCounterProgress}>
            {mantraCount} / {formatMantraTargetLabel(selectedMantraTarget)}
          </Text>
          <Text style={styles.mantraClockText} testID="practice-mantra-clock">
            Clock {formatDurationMmSs(mantraElapsedSec)}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, styles.finishSessionButton, styles.runningEndButton]}
            onPress={completeMantraSession}
            testID="practice-mantra-end"
          >
            <Text style={styles.primaryButtonText}>Finish Session</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (stage === 'intention') {
      return (
        <View style={styles.detailPanel}>
          <Text style={[
            styles.detailTitle,
            styles.selectDurationWeightTitle,
            styles.selectDurationTitleSize,
            styles.selectDurationTitleAlignment,
          ]}>
            Set Intention
          </Text>
          <View style={styles.intentionCard}>
            <Text style={styles.intentionText}>{PRACTICE_INTENTION_TEXT}</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={beginCountdown} testID="practice-begin">
            <Text style={styles.primaryButtonText}>Begin</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (stage === 'running') {
      const target = runningSnapshot?.targetDurationSec || 1;
      const progress = remainingSec / target;
      return (
        <View style={[styles.detailPanel, styles.runningDetailPanel]}>
          <View style={styles.countdownRingWrapper}>
            <PracticeCountdownRing progress={progress} />
          </View>
          <Text style={styles.runningClock} testID="practice-running-clock">{formatDurationMmSs(remainingSec)}</Text>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={togglePauseResume}
            testID="practice-pause-resume"
            accessibilityLabel="Playback toggle"
          >
            {runningSnapshot?.pausedAt ? (
              <View style={styles.playIcon} />
            ) : (
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.finishSessionButton, styles.runningEndButton]}
            onPress={() => completeRunningSession(false)}
            testID="practice-end"
          >
            <Text style={styles.primaryButtonText}>Finish Session</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (stage === 'done') {
      return (
        <View style={styles.detailPanel}>
          <Text style={[
            styles.detailTitle,
            styles.selectDurationWeightTitle,
            styles.selectDurationTitleSize,
            styles.selectDurationTitleAlignment,
          ]}>
            Dedication
          </Text>
          <View style={styles.intentionCard}>
            <Text style={styles.intentionText}>{PRACTICE_DEDICATION_TEXT}</Text>
          </View>
          <Text style={styles.doneSubtext}>Duration {formatDurationMmSs(completedDurationSec)}</Text>
          {completedPracticeMode ? (
            <TouchableOpacity
              style={styles.dedicationAccumulationsRow}
              onPress={openAccumulationsEditor}
              testID="practice-dedication-accumulations-edit"
            >
              <Text style={styles.dedicationAccumulationsLabel}>Accumulations</Text>
              <Text style={styles.dedicationAccumulationsValue}>
                {dedicationAccumulations !== undefined ? dedicationAccumulations : 0}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
            disabled={isSaving}
            onLayout={(event) => {
              const { y, height } = event.nativeEvent.layout;
              setDedicationConfettiOriginY(y + height / 2);
            }}
            onPress={() => {
              void submitSessionSave();
            }}
            testID="practice-dedication-return"
          >
            <Text style={styles.primaryButtonText}>{isSaving ? 'Dedicating...' : 'Dedicate'}</Text>
          </TouchableOpacity>
          <View
            pointerEvents="none"
            style={styles.dedicationCelebrationOverlay}
            testID="practice-dedication-celebration"
          >
            {DEDICATION_CONFETTI_PIECES.map((piece) => {
              const translateX = dedicationCelebrationProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [piece.xStart, piece.xEnd],
              });
              const translateY = dedicationCelebrationProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -piece.yEnd],
              });
              const rotate = dedicationCelebrationProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${piece.rotation}deg`],
              });
              const opacity = dedicationCelebrationProgress.interpolate({
                inputRange: [0, 0.14, 0.82, 1],
                outputRange: [0, 1, 1, 0],
              });

              return (
                <Animated.View
                  key={piece.id}
                  style={[
                    styles.dedicationConfettiPiece,
                    {
                      top: dedicationConfettiOriginY,
                      backgroundColor: piece.color,
                      transform: [{ translateX }, { translateY }, { rotate }],
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        ref={detailScrollRef}
        contentContainerStyle={styles.detailPanel}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        <Text style={styles.selectDurationTitle}>Select Duration</Text>
        <View style={styles.pillsWrap}>
          {PRACTICE_DURATION_PRESETS_MINUTES.map((minute) => {
            const isSelected = selectedDurationSec === minute * 60;
            return (
              <TouchableOpacity
                key={minute}
                style={[styles.minutePill, isSelected && styles.minutePillSelected]}
                onPress={() => setSelectedDurationSec(minute * 60)}
                testID={`practice-minute-${minute}`}
              >
                <Text style={[styles.minutePillText, isSelected && styles.minutePillTextSelected]}>
                  {minute}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.detailClock} testID="practice-detail-clock">{formatDurationMmSs(selectedDurationSec)}</Text>
        <View style={styles.adjustRow}>
          <TouchableOpacity style={styles.adjustButton} onPress={() => handleAdjustMinutes(-1)} testID="practice-minus-minute">
            <Text style={styles.adjustButtonText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adjustButton} onPress={() => handleAdjustMinutes(1)} testID="practice-plus-minute">
            <Text style={styles.adjustButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setShowLinkPicker((prev) => !prev)}
          testID="practice-link-toggle"
        >
          <Text style={styles.linkButtonText}>
            {linkedSession ? `Linked: ${linkedSession.title}` : 'Link Calendar Session (optional)'}
          </Text>
        </TouchableOpacity>

        {showLinkPicker ? (
          <View style={styles.linkList}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => {
                setLinkedSessionId(undefined);
                setShowLinkPicker(false);
              }}
              testID="practice-link-none"
            >
              <Text style={styles.linkRowText}>No linked session</Text>
            </TouchableOpacity>
            {linkableSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.linkRow}
                onPress={() => {
                  setLinkedSessionId(session.id);
                  setShowLinkPicker(false);
                }}
                testID={`practice-link-${session.id}`}
              >
                <Text style={styles.linkRowText}>{session.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {!linkedSessionId ? (
          <TextInput
            style={styles.sessionTitleInput}
            value={sessionTitleInput}
            onChangeText={(text) => {
              setHasTouchedSessionTitle(true);
              setSessionTitleInput(text);
            }}
            onFocus={() => {
              setHasTouchedSessionTitle(true);
              setTimeout(() => {
                detailScrollRef.current?.scrollToEnd({ animated: true });
              }, 120);
            }}
            placeholder={SESSION_TITLE_PLACEHOLDER}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="sentences"
            autoCorrect={false}
            returnKeyType="done"
            testID="practice-session-title-input"
          />
        ) : null}

        <TouchableOpacity style={styles.primaryButton} onPress={() => setStage('intention')} testID="practice-set-intention">
          <Text style={styles.primaryButtonText}>Set Intention</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={headerBackground} style={styles.headerBackground} resizeMode="cover">
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Practice</Text>
        </View>
      </ImageBackground>

      <Animated.View
        style={[
          styles.slidingPages,
          {
            width: screenWidth * 2,
            transform: [{ translateX: slideX }],
          },
        ]}
      >
        <View style={styles.page}>
          <View style={styles.homeBackground}>
            <Image
              source={detailBackground}
              style={styles.homePatternImage}
              resizeMode="cover"
              testID="practice-home-background-pattern"
            />
            <ScrollView style={styles.page} contentContainerStyle={styles.homeContent}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.todayMinutes}</Text>
                  <Text style={styles.statLabel}>Today (min)</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.sevenDayMinutes}</Text>
                  <Text style={styles.statLabel}>7-day (min)</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.streakDays}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
              </View>

              <View style={styles.cardsSection}>
                <TouchableOpacity style={styles.featureCard} onPress={openTimerDetail} testID="practice-card-timed">
                  <Text style={styles.featureCardTitle}>Timed Meditation</Text>
                  <Text style={styles.featureCardSubtitle}>Set duration, intention, and begin</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.featureCard} onPress={openMantraLibrary} testID="practice-card-mantra">
                  <Text style={styles.featureCardTitle}>Mantra Recitations</Text>
                  <Text style={styles.featureCardSubtitle}>Open your mantra library and count recitations</Text>
                </TouchableOpacity>

                <View style={[styles.featureCard, styles.featureCardDisabled]}>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                  <Text style={styles.featureCardTitle}>Sadhana Tracker</Text>
                  <Text style={styles.featureCardSubtitle}>Keep continuity with structured sessions</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.page}>
          <KeyboardAvoidingView
            style={styles.detailBackground}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            <Image
              source={detailBackground}
              style={styles.detailPatternImage}
              resizeMode="cover"
              testID="practice-detail-background-pattern"
            />
            <TouchableOpacity style={styles.backButton} onPress={handleDetailBack} testID="practice-back">
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            {renderDetailContent()}
          </KeyboardAvoidingView>
        </View>
      </Animated.View>

      <Modal visible={showAccumulationsModal} transparent animationType="fade" onRequestClose={() => setShowAccumulationsModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Accumulations</Text>
            <Text style={styles.modalSubtitle}>Optional non-negative integer</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              placeholder={
                dedicationAccumulations !== undefined
                  ? String(dedicationAccumulations)
                  : 'Leave blank or enter a number'
              }
              value={accumulationsInput}
              onChangeText={setAccumulationsInput}
              testID="practice-accumulations-input"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.modalActionButton]}
                onPress={() => setShowAccumulationsModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.modalActionButton]}
                onPress={applyAccumulationsEdit}
                testID="practice-accumulations-save"
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCustomTargetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomTargetModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Custom Target Count</Text>
            <Text style={styles.modalSubtitle}>Enter a non-negative whole number</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              placeholder="e.g. 500"
              value={customTargetInput}
              onChangeText={setCustomTargetInput}
              testID="practice-mantra-custom-target-input"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.modalActionButton]}
                onPress={() => setShowCustomTargetModal(false)}
                testID="practice-mantra-custom-target-cancel"
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.modalActionButton]}
                onPress={applyCustomMantraTarget}
                testID="practice-mantra-custom-target-save"
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
  },
  headerBackground: {
    width: '100%',
    minHeight: 144,
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandOverlay,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  slidingPages: {
    flex: 1,
    flexDirection: 'row',
  },
  page: {
    width: screenWidth,
    flex: 1,
  },
  homeBackground: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    overflow: 'hidden',
  },
  homePatternImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  homeContent: {
    paddingBottom: spacing.xl + spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  featureCardDisabled: {
    opacity: 0.72,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brandInk,
  },
  featureCardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warningText,
  },
  detailBackground: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    overflow: 'hidden',
  },
  detailPatternImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }],
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontSize: 18,
    color: colors.accentStrong,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  detailPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.sm,
    paddingBottom: spacing.xl,
  },
  donePanel: {
    position: 'relative',
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: spacing.md,
  },
  selectDurationWeightTitle: {
    fontWeight: '500',
  },
  selectDurationTitleSize: {
    fontSize: 22,
  },
  selectDurationTitleAlignment: {
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  sectionLabelSpacing: {
    marginTop: spacing.md,
  },
  selectDurationTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.brandInk,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  minutePill: {
    width: '23%',
    minHeight: 54,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  minutePillSelected: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  minutePillText: {
    fontSize: 15,
    color: colors.brandPrimaryDark,
    fontWeight: '700',
    textAlign: 'center',
  },
  minutePillTextSelected: {
    color: colors.white,
  },
  targetPillsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingRight: spacing.xs,
  },
  targetPill: {
    minWidth: 64,
    height: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailClock: {
    fontSize: 44,
    lineHeight: 52,
    color: colors.brandPrimaryDark,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  runningClock: {
    fontSize: 56,
    lineHeight: 66,
    color: colors.brandPrimaryDark,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  countdownRingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  countdownRing: {
    width: COUNTDOWN_RING_SIZE,
    height: COUNTDOWN_RING_SIZE,
    position: 'relative',
  },
  countdownRingSegment: {
    position: 'absolute',
    width: COUNTDOWN_SEGMENT_WIDTH,
    height: COUNTDOWN_SEGMENT_HEIGHT,
    borderRadius: 2,
    backgroundColor: colors.accentStrong,
  },
  countdownSun: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    top: (COUNTDOWN_RING_SIZE - 74) / 2,
    left: (COUNTDOWN_RING_SIZE - 74) / 2,
    backgroundColor: '#FACC15',
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 30,
    lineHeight: 30,
    color: colors.brandPrimaryDark,
    fontWeight: '500',
  },
  linkButton: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  linkButtonText: {
    fontSize: 14,
    color: colors.placeholder,
    fontWeight: '600',
  },
  linkList: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSolid,
  },
  linkRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  linkRowText: {
    fontSize: 14,
    color: colors.brandInk,
  },
  sessionTitleInput: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  intentionCard: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  intentionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  doneSubtext: {
    fontSize: 18,
    color: colors.brandPrimaryDark,
    marginBottom: spacing.lg,
  },
  dedicationAccumulationsRow: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dedicationAccumulationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dedicationAccumulationsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  runningEndButton: {
    marginTop: 'auto',
    marginBottom: spacing.xs,
  },
  runningDetailPanel: {
    flex: 1,
  },
  mantraLibraryList: {
    gap: spacing.sm,
  },
  mantraCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderInput,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  mantraCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mantraCardHeaderText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  mantraCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: 4,
  },
  mantraCardMantra: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mantraCardChevron: {
    fontSize: 22,
    color: colors.brandPrimaryDark,
    lineHeight: 24,
  },
  mantraCardExpanded: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: spacing.md,
  },
  mantraCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  mantraInProgressRow: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mantraInProgressTextWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  mantraInProgressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimaryDark,
  },
  mantraInProgressMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  mantraInProgressChevron: {
    fontSize: 22,
    color: colors.brandPrimaryDark,
    lineHeight: 22,
  },
  mantraCounterSubtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  mantraClockText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  mantraCounterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  mantraCounterButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mantraCounterValue: {
    fontSize: 52,
    fontWeight: '600',
    color: colors.brandPrimaryDark,
  },
  mantraCounterHint: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },
  mantraCounterProgress: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.brandPrimaryDark,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  playPauseButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.brandPrimaryDark,
    marginLeft: 3,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.brandPrimaryDark,
  },
  primaryButton: {
    backgroundColor: colors.accentStrong,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  finishSessionButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.68)',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryButton: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlayBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surfaceSolid,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brandInk,
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalInput: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceStrong,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalActionButton: {
    flex: 1,
  },
  dedicationCelebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 2,
  },
  dedicationConfettiPiece: {
    position: 'absolute',
    width: 7,
    height: 13,
    borderRadius: 2,
  },
});

export default PracticeView;
