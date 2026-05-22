import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  RIKPA_DURATION_LABELS,
  RIKPA_DURATION_PRESETS_SECONDS,
  RIKPA_RECOGNITION_DEFAULT,
  RIKPA_RECOGNITION_LABELS,
} from '../../constants/rikpa';
import {
  RikpaEntry,
  RikpaInsights,
  RikpaTodaySummary,
  RikpaWeekGroup,
  formatRikpaDayLabel,
  formatRikpaDuration,
  formatRikpaEntryTime,
  formatRikpaTotalDuration,
  getRikpaInsights,
  getRikpaTodaySummary,
  getRikpaWeekGroups,
} from '../../utils/rikpa';
import { colors, spacing } from '../../theme/tokens';

interface RikpaViewProps {
  entries: RikpaEntry[];
  onLog: (recognition: number, duration: number) => void;
}

type RikpaTab = 'history' | 'insights';
type InsightsPeriod = '7d' | '30d' | '90d';

const RikpaView: React.FC<RikpaViewProps> = ({ entries, onLog }) => {
  const [activeTab, setActiveTab] = useState<RikpaTab>('history');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logRecognition, setLogRecognition] = useState(RIKPA_RECOGNITION_DEFAULT);
  const [logDuration, setLogDuration] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [insightsPeriod, setInsightsPeriod] = useState<InsightsPeriod>('7d');

  const today = getRikpaTodaySummary(entries);
  const weekGroups = getRikpaWeekGroups(entries);
  const insights = getRikpaInsights(entries);

  const openLogModal = () => {
    setLogRecognition(RIKPA_RECOGNITION_DEFAULT);
    setLogDuration(0);
    setShowLogModal(true);
  };

  const submitLog = () => {
    onLog(logRecognition, logDuration);
    setShowLogModal(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleWeek = (weekLabel: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekLabel)) next.delete(weekLabel);
      else next.add(weekLabel);
      return next;
    });
  };

  const toggleDay = (dateKey: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  const renderTodaySummary = (summary: RikpaTodaySummary) => (
    <View style={styles.summaryRow}>
      <View style={styles.summaryTile}>
        <Text style={styles.summaryValue}>{summary.count}</Text>
        <Text style={styles.summaryLabel}>Today</Text>
      </View>
      <View style={styles.summaryTile}>
        <Text style={styles.summaryValue}>
          {summary.avgRecognition !== null ? summary.avgRecognition.toFixed(1) : '—'}
        </Text>
        <Text style={styles.summaryLabel}>Avg recognition</Text>
      </View>
      <View style={styles.summaryTile}>
        <Text style={styles.summaryValue}>
          {formatRikpaTotalDuration(summary.totalDuration)}
        </Text>
        <Text style={styles.summaryLabel}>Duration</Text>
      </View>
    </View>
  );

  const renderHistory = (groups: RikpaWeekGroup[]) => {
    if (groups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No entries yet. Tap + to log your first moment.</Text>
        </View>
      );
    }

    return (
      <View style={styles.weekList}>
        {groups.map(group => {
          const isWeekExpanded = expandedWeeks.has(group.weekLabel);
          return (
            <View key={group.weekLabel} style={styles.weekGroup}>
              <TouchableOpacity
                style={styles.weekHeader}
                onPress={() => toggleWeek(group.weekLabel)}
                activeOpacity={0.75}
              >
                <View style={styles.weekHeaderLeft}>
                  <Text style={styles.weekLabel}>{group.weekLabel}</Text>
                  <Text style={styles.weekMeta}>{group.totalCount} instances</Text>
                </View>
                <Text style={styles.chevron}>{isWeekExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>

              {isWeekExpanded && (
                <View style={styles.dayList}>
                  {group.days.map(day => {
                    const isDayExpanded = expandedDays.has(day.dateKey);
                    return (
                      <View key={day.dateKey} style={styles.dayGroup}>
                        <TouchableOpacity
                          style={styles.dayHeader}
                          onPress={() => toggleDay(day.dateKey)}
                          activeOpacity={0.75}
                        >
                          <View style={styles.dayHeaderLeft}>
                            <Text style={styles.dayLabel}>
                              {formatRikpaDayLabel(day.date)}
                            </Text>
                            <Text style={styles.dayMeta}>
                              {day.count} · avg {day.avgRecognition.toFixed(1)}
                              {day.totalDuration > 0
                                ? ` · ${formatRikpaTotalDuration(day.totalDuration)}`
                                : ''}
                            </Text>
                          </View>
                          <Text style={styles.chevronSm}>{isDayExpanded ? '⌃' : '⌄'}</Text>
                        </TouchableOpacity>

                        {isDayExpanded && (
                          <View style={styles.entryList}>
                            {day.entries.map(entry => (
                              <View key={entry.id} style={styles.entryRow}>
                                <Text style={styles.entryTime}>
                                  {formatRikpaEntryTime(entry.practice_at)}
                                </Text>
                                <Text style={styles.entryRecognition}>
                                  {RIKPA_RECOGNITION_LABELS[entry.recognition]}
                                </Text>
                                <Text style={styles.entryDuration}>
                                  {formatRikpaDuration(entry.duration)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderInsights = (data: RikpaInsights) => {
    const periodData =
      insightsPeriod === '7d' ? data.period7
      : insightsPeriod === '30d' ? data.period30
      : data.period90;

    return (
      <View style={styles.insightsWrap}>
        <View style={styles.insightsAllTimeRow}>
          <View style={styles.insightsTile}>
            <Text style={styles.insightsBigValue}>{data.allTimeCount}</Text>
            <Text style={styles.insightsLabel}>All-time</Text>
          </View>
          <View style={styles.insightsTile}>
            <Text style={styles.insightsBigValue}>{data.streakDays}</Text>
            <Text style={styles.insightsLabel}>Day streak</Text>
          </View>
          <View style={styles.insightsTile}>
            <Text style={styles.insightsBigValue}>{data.bestDayCount}</Text>
            <Text style={styles.insightsLabel}>Best day</Text>
          </View>
        </View>

        <View style={styles.periodTabRow}>
          {(['7d', '30d', '90d'] as InsightsPeriod[]).map(p => (
            <TouchableOpacity
              key={p}
              testID={`rikpa-period-tab-${p}`}
              style={[styles.periodTab, insightsPeriod === p && styles.periodTabActive]}
              onPress={() => setInsightsPeriod(p)}
            >
              <Text style={[styles.periodTabText, insightsPeriod === p && styles.periodTabTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.periodStatsCard}>
          <View style={styles.periodStatRow}>
            <Text style={styles.periodStatLabel}>Remembering</Text>
            <Text style={styles.periodStatValue}>{periodData.count} instances</Text>
          </View>
          <View style={styles.periodStatDivider} />
          <View style={styles.periodStatRow}>
            <Text style={styles.periodStatLabel}>Avg Recognition</Text>
            <Text style={styles.periodStatValue}>
              {periodData.avgRecognition !== null
                ? `${periodData.avgRecognition.toFixed(1)} / 5`
                : '—'}
            </Text>
          </View>
          <View style={styles.periodStatDivider} />
          <View style={styles.periodStatRow}>
            <Text style={styles.periodStatLabel}>Total Abiding</Text>
            <Text style={styles.periodStatValue}>
              {formatRikpaTotalDuration(periodData.totalDuration)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLogModal = () => (
    <Modal
      visible={showLogModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLogModal(false)}
    >
      <Pressable style={styles.modalBackdrop} onPress={() => setShowLogModal(false)}>
        <Pressable style={styles.logSheet} onPress={() => {}}>
          <View style={styles.logSheetHandle} />

          <Text style={styles.logSheetTitle}>Log Rikpa</Text>

          <Text style={styles.logSectionLabel}>Recognition</Text>
          <View style={styles.recognitionRow}>
            {[1, 2, 3, 4, 5].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.recognitionButton,
                  logRecognition === level && styles.recognitionButtonActive,
                ]}
                onPress={() => {
                  setLogRecognition(level);
                  void Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.recognitionButtonText,
                  logRecognition === level && styles.recognitionButtonTextActive,
                ]}>
                  {level}
                </Text>
                <Text style={[
                  styles.recognitionLabel,
                  logRecognition === level && styles.recognitionLabelActive,
                ]}>
                  {RIKPA_RECOGNITION_LABELS[level]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.logSectionLabel}>Duration (optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.durationPillsRow}
          >
            {RIKPA_DURATION_PRESETS_SECONDS.map(sec => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.durationPill,
                  logDuration === sec && styles.durationPillActive,
                ]}
                onPress={() => {
                  setLogDuration(sec);
                  void Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.durationPillText,
                  logDuration === sec && styles.durationPillTextActive,
                ]}>
                  {RIKPA_DURATION_LABELS[sec]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.logButton} onPress={submitLog}>
            <Text style={styles.logButtonText}>Log</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderTodaySummary(today)}

      <View style={styles.tabBar}>
        <TouchableOpacity
          testID="rikpa-tab-history"
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="rikpa-tab-insights"
          style={[styles.tabItem, activeTab === 'insights' && styles.tabItemActive]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabLabel, activeTab === 'insights' && styles.tabLabelActive]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.tabContentInner}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'history'
          ? renderHistory(weekGroups)
          : renderInsights(insights)}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={openLogModal}
        activeOpacity={0.85}
        testID="rikpa-fab"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {renderLogModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Today summary
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  summaryTile: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderInput,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.danger,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.white,
  },

  // Tab content
  tabContent: {
    flex: 1,
  },
  tabContentInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  // History
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  weekList: {
    gap: spacing.sm,
  },
  weekGroup: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderInput,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  weekHeaderLeft: {
    flex: 1,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandInk,
  },
  weekMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 18,
    color: colors.brandPrimaryDark,
    lineHeight: 20,
  },
  dayList: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  dayGroup: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayMeta: {
    marginTop: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chevronSm: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  entryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  entryTime: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 72,
  },
  entryRecognition: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimaryDark,
    flex: 1,
  },
  entryDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Insights
  insightsWrap: {
    gap: spacing.md,
  },
  insightsAllTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  insightsTile: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  insightsBigValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  insightsLabel: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  periodTabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderInput,
    overflow: 'hidden',
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: colors.danger,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTabTextActive: {
    color: colors.white,
  },
  periodStatsCard: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderInput,
    overflow: 'hidden',
  },
  periodStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  periodStatDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: spacing.md,
  },
  periodStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  periodStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },

  // FAB
  fab: {
    alignSelf: 'center',
    marginVertical: spacing.xl,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: {
    fontSize: 52,
    lineHeight: 56,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },

  // Log modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlayBackdrop,
    justifyContent: 'flex-end',
  },
  logSheet: {
    backgroundColor: colors.surfaceSolid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + spacing.lg,
  },
  logSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderInput,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  logSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brandInk,
    marginBottom: spacing.lg,
  },
  logSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  recognitionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  recognitionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
  },
  recognitionButtonActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  recognitionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandPrimaryDark,
  },
  recognitionButtonTextActive: {
    color: colors.white,
  },
  recognitionLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recognitionLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  durationPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingRight: spacing.xs,
  },
  durationPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceStrong,
    minWidth: 52,
    alignItems: 'center',
  },
  durationPillActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  durationPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimaryDark,
  },
  durationPillTextActive: {
    color: colors.white,
  },
  logButton: {
    backgroundColor: colors.accentStrong,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default RikpaView;
