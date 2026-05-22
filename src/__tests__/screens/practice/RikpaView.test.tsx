import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import RikpaView from '../../../screens/practice/RikpaView';
import { RikpaEntry } from '../../../utils/rikpa';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics');

const makeEntry = (practice_at: number, recognition = 3, duration = 0): RikpaEntry => ({
  id: `rikpa-${practice_at}`,
  practice_at,
  recognition,
  duration,
  notes: '',
});

const ms = (iso: string) => new Date(iso).getTime();

const setup = (entries: RikpaEntry[] = [], onLog = jest.fn()) =>
  render(<RikpaView entries={entries} onLog={onLog} />);

describe('RikpaView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Today summary ---

  it('shows zero-state today summary when no entries', () => {
    const { getByText, getAllByText } = setup();
    expect(getAllByText('0')[0]).toBeTruthy(); // count tile
    expect(getByText('—')).toBeTruthy();       // avgRecognition null → —
    expect(getByText('0m')).toBeTruthy();       // totalDuration
  });

  it('renders today tile with correct count when entries exist today', () => {
    const now = Date.now();
    const entries = [makeEntry(now - 1000), makeEntry(now - 2000)];
    const { getAllByText } = setup(entries);
    expect(getAllByText('2')[0]).toBeTruthy();
  });

  // --- FAB and log modal ---

  it('renders the FAB button', () => {
    const { getByTestId } = setup();
    expect(getByTestId('rikpa-fab')).toBeTruthy();
  });

  it('opens the log modal when FAB is pressed', async () => {
    const { getByTestId, getByText } = setup();
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => expect(getByText('Log Rikpa')).toBeTruthy());
  });

  it('shows recognition buttons 1–5 in modal', async () => {
    const { getByTestId, getByText } = setup();
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => {
      expect(getByText('Recognition')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
      expect(getByText('Dim')).toBeTruthy();
      expect(getByText('Open')).toBeTruthy();
    });
  });

  it('shows duration pills including Skip in modal', async () => {
    const { getByTestId, getByText } = setup();
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => {
      expect(getByText('Duration (optional)')).toBeTruthy();
      expect(getByText('Skip')).toBeTruthy();
      expect(getByText('5m')).toBeTruthy();
    });
  });

  it('calls onLog with default recognition 3 and duration 0 on immediate Log press', async () => {
    const onLog = jest.fn();
    const { getByTestId, getByText } = setup([], onLog);
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => getByText('Log'));
    fireEvent.press(getByText('Log'));
    expect(onLog).toHaveBeenCalledWith(3, 0);
  });

  it('calls onLog with selected recognition and duration', async () => {
    const onLog = jest.fn();
    const { getByTestId, getByText } = setup([], onLog);
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => getByText('Log Rikpa'));

    fireEvent.press(getByText('5')); // select recognition 5
    fireEvent.press(getByText('5m')); // select 5-minute duration

    fireEvent.press(getByText('Log'));
    expect(onLog).toHaveBeenCalledWith(5, 300);
  });

  it('fires haptic feedback when Log is pressed', async () => {
    const { getByTestId, getByText } = setup();
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => getByText('Log'));
    fireEvent.press(getByText('Log'));
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('closes the modal after logging', async () => {
    const { getByTestId, getByText, queryByText } = setup();
    fireEvent.press(getByTestId('rikpa-fab'));
    await waitFor(() => getByText('Log'));
    fireEvent.press(getByText('Log'));
    await waitFor(() => expect(queryByText('Log Rikpa')).toBeNull());
  });

  // --- History tab ---

  it('shows History tab by default', () => {
    const { getByText } = setup();
    expect(getByText('History')).toBeTruthy();
  });

  it('shows empty state message when no entries in history', () => {
    const { getByText } = setup();
    expect(getByText(/No entries yet/)).toBeTruthy();
  });

  it('shows week groups when entries are present', () => {
    const entries = [makeEntry(Date.now() - 3600_000, 4, 60)];
    const { getByText } = setup(entries);
    expect(getByText(/\w+ \d+/)).toBeTruthy(); // week label contains a date range
  });

  it('expands a week group when tapped to reveal day rows', () => {
    const entries = [makeEntry(Date.now() - 3600_000, 4, 60)];
    const { getAllByText, getByText } = setup(entries);
    // summary tile always shows "Today"; after expanding the week a second "Today" appears as the day label
    const weekHeader = getAllByText(/\w+ \d+/)[0];
    fireEvent.press(weekHeader);
    expect(getAllByText('Today').length).toBeGreaterThanOrEqual(2);
  });

  it('expands a day to show individual entries when tapped', () => {
    const now = Date.now();
    const entries = [
      makeEntry(now - 7200_000, 4, 60),
      makeEntry(now - 3600_000, 2, 0),
    ];
    const { getAllByText, getByText } = setup(entries);
    fireEvent.press(getAllByText(/\w+ \d+/)[0]);     // expand week
    fireEvent.press(getAllByText('Today')[1]);        // tap day label (second "Today" after week expanded)
    expect(getByText('Vivid')).toBeTruthy();
    expect(getByText('Mild')).toBeTruthy();
  });

  // --- Insights tab ---

  it('switches to Insights tab when tapped', () => {
    const { getByText, getAllByText } = setup();
    fireEvent.press(getAllByText('Insights')[0]);
    expect(getByText('All-time')).toBeTruthy();
    expect(getByText('Day streak')).toBeTruthy();
    expect(getByText('Best day')).toBeTruthy();
  });

  it('shows all-time count in Insights', () => {
    const entries = [
      makeEntry(ms('2026-05-19T08:00:00')),
      makeEntry(ms('2026-05-18T08:00:00')),
      makeEntry(ms('2026-05-17T08:00:00')),
    ];
    const { getAllByText } = setup(entries);
    fireEvent.press(getAllByText('Insights')[0]);
    // allTimeCount = 3; use getAllByText since other "3" values may appear
    expect(getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('shows period stats for 7d by default in Insights', () => {
    const { getAllByText, getByText } = setup();
    fireEvent.press(getAllByText('Insights')[0]);
    expect(getByText('Remembering')).toBeTruthy();
    expect(getByText('Avg Recognition')).toBeTruthy();
    expect(getByText('Total Abiding')).toBeTruthy();
  });

  it('switches between 7d / 30d / 90d period tabs in Insights', () => {
    const { getAllByText, getByText } = setup();
    fireEvent.press(getAllByText('Insights')[0]);
    fireEvent.press(getByText('30d'));
    expect(getByText('30d')).toBeTruthy();
    fireEvent.press(getByText('90d'));
    expect(getByText('90d')).toBeTruthy();
  });

  it('active period tab (7d/30d/90d) in Insights uses danger red background', () => {
    const { getAllByText, getByTestId } = setup();
    fireEvent.press(getAllByText('Insights')[0]);
    const tab7d = getByTestId('rikpa-period-tab-7d');
    const style = Array.isArray(tab7d.props.style)
      ? Object.assign({}, ...tab7d.props.style.filter(Boolean))
      : tab7d.props.style ?? {};
    expect(style.backgroundColor).toBe('#991B1B');
  });

  it('active History/Insights tab uses danger red background', () => {
    const { getByTestId } = setup();
    const historyTab = getByTestId('rikpa-tab-history');
    const style = Array.isArray(historyTab.props.style)
      ? Object.assign({}, ...historyTab.props.style.filter(Boolean))
      : historyTab.props.style ?? {};
    expect(style.backgroundColor).toBe('#991B1B');

    fireEvent.press(getByTestId('rikpa-tab-insights'));
    const insightsTab = getByTestId('rikpa-tab-insights');
    const insightsStyle = Array.isArray(insightsTab.props.style)
      ? Object.assign({}, ...insightsTab.props.style.filter(Boolean))
      : insightsTab.props.style ?? {};
    expect(insightsStyle.backgroundColor).toBe('#991B1B');
  });

  it('FAB is centered and larger than the old 56px size', () => {
    const { getByTestId } = setup();
    const fab = getByTestId('rikpa-fab');
    const style = Array.isArray(fab.props.style)
      ? Object.assign({}, ...fab.props.style.filter(Boolean))
      : fab.props.style ?? {};
    expect(style.width).toBeGreaterThan(56);
    expect(style.alignSelf).toBe('center');
    expect(style.position).toBeUndefined();
  });
});
