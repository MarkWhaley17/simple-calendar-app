import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent } from '../../types';
import { PRACTICE_DURATION_PRESETS_MINUTES, PRACTICE_INTENTION_TEXT } from '../../constants/practice';
import {
  PracticeRunningSnapshot,
  PracticeStage,
  PracticeStats,
  TimedPracticeSaveInput,
  calculatePracticeStats,
  clearPracticeRunningSnapshot,
  formatDurationMmSs,
  getElapsedSeconds,
  getLinkableSessions,
  getRemainingSeconds,
  loadPracticeRunningSnapshot,
  savePracticeRunningSnapshot,
} from '../../utils/practice';
import { colors, spacing } from '../../theme/tokens';

const headerBackground = require('../../../assets/day-bg.jpg');
const detailBackground = require('../../../assets/day-view-pattern.png');

interface PracticeViewProps {
  sessions: CalendarEvent[];
  onSessionPress: (session: CalendarEvent) => void;
  onSaveTimedSession: (input: Omit<TimedPracticeSaveInput, 'sessions'>) => Promise<void>;
  onRunningStateChange?: (isRunning: boolean) => void;
}

const screenWidth = Dimensions.get('window').width;
const COUNTDOWN_RING_SIZE = 200;
const COUNTDOWN_RING_SEGMENTS = 72;
const COUNTDOWN_RING_RADIUS = 88;
const COUNTDOWN_SEGMENT_WIDTH = 2;
const COUNTDOWN_SEGMENT_HEIGHT = 8;

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
  onSessionPress,
  onSaveTimedSession,
  onRunningStateChange,
}) => {
  const slideX = useRef(new Animated.Value(0)).current;
  const [stage, setStage] = useState<PracticeStage>('home');
  const [selectedDurationSec, setSelectedDurationSec] = useState(10 * 60);
  const [runningSnapshot, setRunningSnapshot] = useState<PracticeRunningSnapshot | null>(null);
  const [remainingSec, setRemainingSec] = useState(selectedDurationSec);
  const [linkedSessionId, setLinkedSessionId] = useState<string | undefined>(undefined);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [showAccumulationsModal, setShowAccumulationsModal] = useState(false);
  const [accumulationsInput, setAccumulationsInput] = useState('');
  const [completedDurationSec, setCompletedDurationSec] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [sessionEndedAt, setSessionEndedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const stats: PracticeStats = useMemo(() => calculatePracticeStats(sessions), [sessions]);
  const historyItems = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          (b.toDate || b.fromDate || b.date || new Date()).getTime() -
          (a.toDate || a.fromDate || a.date || new Date()).getTime()
      ),
    [sessions]
  );
  const linkableSessions = useMemo(() => getLinkableSessions(sessions), [sessions]);
  const linkedSession = useMemo(
    () => linkableSessions.find((session) => session.id === linkedSessionId),
    [linkableSessions, linkedSessionId]
  );

  const openTimerDetail = () => {
    setStage('timerDetail');
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

  useEffect(() => {
    loadPracticeRunningSnapshot().then((snapshot) => {
      if (!snapshot) return;
      setSelectedDurationSec(snapshot.selectedDurationSec);
      setLinkedSessionId(snapshot.linkedSessionId);
      setRunningSnapshot(snapshot);
      setStage('running');
      setRemainingSec(getRemainingSeconds(snapshot, Date.now()));
      slideX.setValue(-screenWidth);
    });
  }, [slideX]);

  useEffect(() => {
    void persistSnapshot(runningSnapshot);
    onRunningStateChange?.(Boolean(runningSnapshot));
  }, [runningSnapshot, onRunningStateChange]);

  useEffect(() => {
    if (!runningSnapshot || stage !== 'running') return;

    const tick = () => {
      const nowMs = Date.now();
      const nextRemaining = getRemainingSeconds(runningSnapshot, nowMs);
      setRemainingSec(nextRemaining);
      if (nextRemaining <= 0) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        completeRunningSession(true);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [runningSnapshot, stage]);

  const beginCountdown = () => {
    const now = new Date();
    const snapshot: PracticeRunningSnapshot = {
      runningSessionId: `practice-${now.getTime()}`,
      startedAt: now.toISOString(),
      accumulatedPausedMs: 0,
      targetDurationSec: selectedDurationSec,
      selectedDurationSec,
      linkedSessionId,
      stage: 'running',
    };
    setSessionStartedAt(now);
    setSessionEndedAt(null);
    setCompletedDurationSec(0);
    setRunningSnapshot(snapshot);
    setRemainingSec(selectedDurationSec);
    setStage('running');
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

  const completeRunningSession = (fromCountdownCompletion = false) => {
    if (!runningSnapshot) return;
    const endedAt = new Date();
    const startedAt = new Date(runningSnapshot.startedAt);
    const elapsedSec = runningSnapshot.targetDurationSec - getRemainingSeconds(runningSnapshot, endedAt.getTime());
    const safeDuration = Math.max(0, elapsedSec);

    setCompletedDurationSec(safeDuration);
    setSessionStartedAt(startedAt);
    setSessionEndedAt(endedAt);
    setRunningSnapshot(null);
    setStage('done');
    setShowAccumulationsModal(true);
    if (!fromCountdownCompletion) {
      void Haptics.selectionAsync();
    }
  };

  const resetAfterSave = () => {
    setShowAccumulationsModal(false);
    setAccumulationsInput('');
    setCompletedDurationSec(0);
    setSessionStartedAt(null);
    setSessionEndedAt(null);
    setLinkedSessionId(undefined);
    setShowLinkPicker(false);
    returnHome();
  };

  const submitSessionSave = async () => {
    if (!sessionStartedAt || !sessionEndedAt) return;
    if (accumulationsInput && !/^\d+$/.test(accumulationsInput)) {
      Alert.alert('Invalid Accumulations', 'Accumulations must be a non-negative integer.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveTimedSession({
        startedAt: sessionStartedAt,
        endedAt: sessionEndedAt,
        durationSec: completedDurationSec,
        linkedSessionId,
        accumulations: accumulationsInput ? Number(accumulationsInput) : undefined,
      });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      resetAfterSave();
    } finally {
      setIsSaving(false);
    }
  };

  const formatHistoryDate = (session: CalendarEvent): string => {
    const anchor = session.toDate || session.fromDate || session.date || new Date();
    return anchor.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getHistoryDurationLabel = (session: CalendarEvent): string => {
    if (typeof session.durationSeconds === 'number') {
      return formatDurationMmSs(session.durationSeconds);
    }
    if (session.fromDate && session.toDate) {
      const diffSec = Math.floor((session.toDate.getTime() - session.fromDate.getTime()) / 1000);
      if (diffSec > 0) return formatDurationMmSs(diffSec);
    }
    return '--:--';
  };

  const renderDetailContent = () => {
    if (stage === 'intention') {
      return (
        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>Set Intention</Text>
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
        <View style={styles.detailPanel}>
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
            style={[styles.primaryButton, styles.runningEndButton]}
            onPress={() => completeRunningSession(false)}
            testID="practice-end"
          >
            <Text style={styles.primaryButtonText}>End</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (stage === 'done') {
      return (
        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>Session Complete</Text>
          <Text style={styles.doneSubtext}>Duration {formatDurationMmSs(completedDurationSec)}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowAccumulationsModal(true)}
            testID="practice-save-session"
          >
            <Text style={styles.primaryButtonText}>Save Session</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.detailPanel}>
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

            <View style={[styles.featureCard, styles.featureCardDisabled]}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.featureCardTitle}>Mantra Counter</Text>
              <Text style={styles.featureCardSubtitle}>Track repetitions and streaks</Text>
            </View>

            <View style={[styles.featureCard, styles.featureCardDisabled]}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.featureCardTitle}>Sadhana Tracker</Text>
              <Text style={styles.featureCardSubtitle}>Keep continuity with structured sessions</Text>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Session History</Text>
            {historyItems.length === 0 ? (
              <Text style={styles.historyEmptyText}>No sessions yet.</Text>
            ) : (
              historyItems.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.historyRow}
                  onPress={() => onSessionPress(session)}
                  activeOpacity={0.8}
                  testID={`practice-history-${session.id}`}
                >
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyRowTitle}>{session.title}</Text>
                    <Text style={styles.historyRowDate}>{formatHistoryDate(session)}</Text>
                  </View>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyDuration}>{getHistoryDurationLabel(session)}</Text>
                    <Text style={styles.historyAccumulations}>
                      A: {typeof session.accumulations === 'number' ? session.accumulations : '-'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.page}>
          <View style={styles.detailBackground}>
            <Image
              source={detailBackground}
              style={styles.detailPatternImage}
              resizeMode="cover"
              testID="practice-detail-background-pattern"
            />
            <TouchableOpacity style={styles.backButton} onPress={returnHome} testID="practice-back">
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            {renderDetailContent()}
          </View>
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
              placeholder="Leave blank or enter a number"
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
                onPress={submitSessionSave}
                disabled={isSaving}
                testID="practice-accumulations-save"
              >
                <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
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
  historySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: spacing.sm,
  },
  historyEmptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  historyRow: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderInput,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyMeta: {
    flex: 1,
  },
  historyRowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: 6,
  },
  historyRowDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
    marginBottom: 4,
  },
  historyAccumulations: {
    fontSize: 12,
    color: colors.textSecondary,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 18,
    color: colors.accentStrong,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  detailPanel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: spacing.md,
  },
  selectDurationTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.brandInk,
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  },
  minutePillTextSelected: {
    color: colors.white,
  },
  detailClock: {
    fontSize: 44,
    lineHeight: 52,
    color: colors.brandPrimaryDark,
    fontWeight: '700',
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
    color: colors.textSecondary,
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
  runningEndButton: {
    marginTop: spacing.md,
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
});

export default PracticeView;
