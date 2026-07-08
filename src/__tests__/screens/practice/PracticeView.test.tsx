import React from 'react';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { Alert, Keyboard } from 'react-native';
import PracticeView from '../../../screens/practice/PracticeView';
import { CalendarEvent } from '../../../types';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('PracticeView', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  const baseSession: CalendarEvent = {
    id: 'session-1',
    title: 'Morning Session',
    fromDate: new Date(2026, 2, 14, 8, 0, 0),
    toDate: new Date(2026, 2, 14, 8, 20, 0),
    durationSeconds: 1200,
    accumulations: 3,
    practiceSource: 'timed-meditation',
  };

  const setup = (sessions: CalendarEvent[] = [baseSession]) => {
    const onSaveTimedSession = jest.fn().mockResolvedValue(undefined);
    const onRunningStateChange = jest.fn();
    const view = render(
      <PracticeView
        sessions={sessions}
        onSaveTimedSession={onSaveTimedSession}
        onRunningStateChange={onRunningStateChange}
      />
    );
    return {
      ...view,
      onSaveTimedSession,
      onRunningStateChange,
    };
  };

  it('renders dashboard and practice cards', () => {
    const { getByText, getAllByText, getByTestId } = setup();

    expect(getByText('Practice')).toBeTruthy();
    expect(getAllByText('Timed Meditation').length).toBeGreaterThan(0);
    expect(getByText('Mantra Recitations')).toBeTruthy();
    expect(getByTestId('practice-card-mantra')).toBeTruthy();
    expect(() => getByText('Session History')).toThrow();
  });

  it('mantra text is hidden in library list but shown on setup screen', () => {
    const { getByTestId, queryByText, getByText } = setup();
    fireEvent.press(getByTestId('practice-card-mantra'));
    // Mantra text should NOT appear in the library list
    expect(queryByText(/Om Tare Tuttare/)).toBeNull();
    // Selecting the mantra should show its text on the setup screen
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    expect(getByText(/Om Tare Tuttare/)).toBeTruthy();
  });

  it('practice card subtitles use danger red at 0.7 opacity', () => {
    const { getByText } = setup();
    const subtitle = getByText('Set duration, intention, and begin');
    const style = Array.isArray(subtitle.props.style)
      ? Object.assign({}, ...subtitle.props.style.filter(Boolean))
      : subtitle.props.style ?? {};
    expect(style.color).toBe('#991B1B');
    expect(style.opacity).toBe(0.7);
  });

  it('opens timer detail from card and updates time using preset and +/- controls', () => {
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-timed'));
    expect(getByTestId('practice-set-intention')).toBeTruthy();
    expect(getByTestId('practice-session-title-input').props.placeholder).toBe('Add a Session Title (optional)');

    fireEvent.press(getByTestId('practice-minute-20'));
    expect(getByTestId('practice-detail-clock').props.children).toBe('20:00');

    fireEvent.press(getByTestId('practice-minus-minute'));
    expect(getByTestId('practice-detail-clock').props.children).toBe('19:00');
    fireEvent.press(getByTestId('practice-plus-minute'));
    expect(getByTestId('practice-detail-clock').props.children).toBe('20:00');
  });

  it('runs through intention and saves a completed session', async () => {
    const { getByTestId, getByText, onSaveTimedSession } = setup();

    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('practice-begin'));

    expect(getByTestId('practice-end')).toBeTruthy();
    fireEvent.press(getByTestId('practice-end'));

    expect(getByText('Dedication')).toBeTruthy();
    fireEvent.press(getByTestId('practice-dedication-accumulations-edit'));
    fireEvent.changeText(getByTestId('practice-accumulations-input'), '5');
    fireEvent.press(getByTestId('practice-accumulations-save'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(onSaveTimedSession).toHaveBeenCalledTimes(1);
    });

    expect(onSaveTimedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        durationSec: expect.any(Number),
        sessionTitle: 'Timed Meditation',
        accumulations: 5,
      })
    );
    expect(getByText('Practice')).toBeTruthy();
  });

  it('passes a custom session title for unlinked timed sessions', async () => {
    const { getByTestId, onSaveTimedSession } = setup();

    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.changeText(getByTestId('practice-session-title-input'), 'Evening Sit');
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('practice-begin'));
    fireEvent.press(getByTestId('practice-end'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(onSaveTimedSession).toHaveBeenCalledTimes(1);
    });

    expect(onSaveTimedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionTitle: 'Evening Sit',
      })
    );
  });

  it('plays the gong when beginning a timed session', async () => {
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('practice-begin'));

    await waitFor(() => {
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });
  });

  it('keeps timed session progress when backing out and reopening timed meditation', () => {
    const { getByTestId, queryByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('practice-begin'));
    expect(getByTestId('practice-running-clock')).toBeTruthy();

    fireEvent.press(getByTestId('practice-back'));
    expect(getByTestId('practice-card-timed')).toBeTruthy();

    fireEvent.press(getByTestId('practice-card-timed'));
    expect(getByTestId('practice-running-clock')).toBeTruthy();
    expect(getByTestId('practice-end')).toBeTruthy();
    expect(queryByTestId('practice-set-intention')).toBeNull();
  });

  it('Seven-Line Supplication shows in the mantra library', () => {
    const { getByTestId, getByText } = setup();
    fireEvent.press(getByTestId('practice-card-mantra'));
    expect(getByText('Seven-Line Supplication to Padmakara')).toBeTruthy();
  });

  it('runs mantra counter flow from library to recitation counting', () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    expect(getByText('Mantra Library')).toBeTruthy();

    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));

    expect(getByText('Condensed Supplication to Tara')).toBeTruthy();
    expect(getByTestId('practice-mantra-link-toggle')).toBeTruthy();
    expect(getByTestId('practice-mantra-session-title-input')).toBeTruthy();
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));

    expect(getByText('Set Intention')).toBeTruthy();
    fireEvent.press(getByTestId('practice-mantra-start'));

    expect(getByTestId('practice-mantra-counter-value').props.children).toBe(0);
    expect(getByTestId('practice-mantra-clock')).toBeTruthy();
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    expect(getByTestId('practice-mantra-counter-value').props.children).toBe(2);
    expect(getByTestId('practice-mantra-end')).toBeTruthy();
  });

  it('accepts a custom mantra target count from modal input', () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));

    fireEvent.press(getByTestId('practice-mantra-target-custom'));
    fireEvent.changeText(getByTestId('practice-mantra-custom-target-input'), '500');
    fireEvent.press(getByTestId('practice-mantra-custom-target-save'));

    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    expect(getByText('0 / 500')).toBeTruthy();
  });

  it('plays gong when entering and leaving mantra counter page', async () => {
    const { getByTestId, getByText } = setup();
    (Audio.Sound.createAsync as jest.Mock).mockClear();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));

    await waitFor(() => {
      expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByTestId('practice-mantra-end'));

    await waitFor(() => {
      expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(2);
    });
    expect(getByText('Dedication')).toBeTruthy();
  });

  it('shows editable accumulations on mantra dedication and saves selected value', async () => {
    const { getByTestId, getByText, onSaveTimedSession } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-end'));

    expect(getByText('Dedication')).toBeTruthy();
    expect(getByText('Accumulations')).toBeTruthy();

    fireEvent.press(getByTestId('practice-dedication-accumulations-edit'));
    fireEvent.changeText(getByTestId('practice-accumulations-input'), '12');
    fireEvent.press(getByTestId('practice-accumulations-save'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(onSaveTimedSession).toHaveBeenCalledTimes(1);
    });

    expect(onSaveTimedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accumulations: 12,
      })
    );
  });

  it('defaults mantra dedication accumulations to the completed recitation count', () => {
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-end'));

    const accumulationRow = getByTestId('practice-dedication-accumulations-edit');
    expect(within(accumulationRow).getByText('3')).toBeTruthy();
  });

  it('shows in-progress mantra row in library when backing from active mantra session', () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-back'));

    expect(getByTestId('practice-mantra-in-progress-condensed-tara')).toBeTruthy();
    expect(getByText('In Progress Condensed Supplication to Tara Mantra')).toBeTruthy();
    expect(getByText('Target: 108, Done: 2')).toBeTruthy();
  });

  it('keeps in-progress mantra row after finishing early and returning to library', async () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-end'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(getByText('Practice')).toBeTruthy();
    });

    fireEvent.press(getByTestId('practice-card-mantra'));
    expect(getByTestId('practice-mantra-in-progress-condensed-tara')).toBeTruthy();
    expect(getByText('Target: 108, Done: 2')).toBeTruthy();
  });

  it('opens set intention then resumes mantra session from in-progress row', async () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-end'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(getByTestId('practice-card-mantra')).toBeTruthy();
    });

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-in-progress-condensed-tara'));

    expect(getByText('Set Intention')).toBeTruthy();
    fireEvent.press(getByTestId('practice-mantra-start'));
    expect(getByTestId('practice-mantra-counter-value').props.children).toBe(2);
  });

  it('shows overwrite warning when adding a mantra with in-progress progress', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-end'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(getByTestId('practice-card-mantra')).toBeTruthy();
    });

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Session In Progress',
      'Are you sure you want to start a fresh Condensed Supplication to Tara session? This will overwrite your progress towards your existing goal.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Resume Existing' }),
        expect.objectContaining({ text: 'Start Fresh', style: 'destructive' }),
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
      ])
    );

    alertSpy.mockRestore();
  });

  it('can resume existing progress from overwrite warning', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-end'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(getByTestId('practice-card-mantra')).toBeTruthy();
    });

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));

    const [, , alertActions] = (alertSpy.mock.calls.at(-1) ?? []) as [
      string,
      string,
      Array<{ text: string; onPress?: () => void }>
    ];
    const resumeAction = alertActions.find(action => action.text === 'Resume Existing');
    expect(resumeAction).toBeTruthy();
    await act(async () => {
      resumeAction?.onPress?.();
    });

    await waitFor(() => {
      expect(getByText('Set Intention')).toBeTruthy();
    });
    fireEvent.press(getByTestId('practice-mantra-start'));
    expect(getByTestId('practice-mantra-counter-value').props.children).toBe(2);

    alertSpy.mockRestore();
  });

  it('can start fresh from overwrite warning and reset progress', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-end'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(getByTestId('practice-card-mantra')).toBeTruthy();
    });

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));

    const [, , alertActions] = (alertSpy.mock.calls.at(-1) ?? []) as [
      string,
      string,
      Array<{ text: string; onPress?: () => void }>
    ];
    const freshAction = alertActions.find(action => action.text === 'Start Fresh');
    expect(freshAction).toBeTruthy();
    await act(async () => {
      freshAction?.onPress?.();
    });

    expect(getByTestId('practice-mantra-set-intention')).toBeTruthy();
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    expect(getByTestId('practice-mantra-counter-value').props.children).toBe(0);

    alertSpy.mockRestore();
  });

  it('preserves linked mantra accumulations when editor is opened and saved without edits', async () => {
    const today = new Date();
    const linkedWithAccumulations: CalendarEvent = {
      id: 'session-2',
      title: 'Linked Mantra Session',
      fromDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      toDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15, 0),
      accumulations: 9,
    };
    const { getByTestId, getByText, onSaveTimedSession } = setup([baseSession, linkedWithAccumulations]);

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-link-toggle'));
    fireEvent.press(getByTestId('practice-mantra-link-session-2'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-end'));

    expect(getByText('9')).toBeTruthy();
    fireEvent.press(getByTestId('practice-dedication-accumulations-edit'));
    expect(getByTestId('practice-accumulations-input').props.placeholder).toBe('9');
    fireEvent.press(getByTestId('practice-accumulations-save'));
    fireEvent.press(getByTestId('practice-dedication-return'));

    await waitFor(() => {
      expect(onSaveTimedSession).toHaveBeenCalledTimes(1);
    });
    expect(onSaveTimedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accumulations: 9,
      })
    );
  });

  it('reports running-state changes for active mantra sessions', async () => {
    const { getByTestId, onRunningStateChange } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));

    await waitFor(() => {
      expect(onRunningStateChange).toHaveBeenLastCalledWith(true);
    });

    fireEvent.press(getByTestId('practice-back'));

    await waitFor(() => {
      expect(onRunningStateChange).toHaveBeenLastCalledWith(false);
    });
  });

  it('restores an active mantra session after remounting the screen', async () => {
    const firstMount = setup();
    fireEvent.press(firstMount.getByTestId('practice-card-mantra'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-add-condensed-tara'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-set-intention'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-start'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-counter-button'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-counter-button'));
    firstMount.unmount();

    const secondMount = setup();
    const restoredCounter = await secondMount.findByTestId('practice-mantra-counter-value');
    const restoredClock = await secondMount.findByTestId('practice-mantra-clock');

    expect(restoredCounter.props.children).toBe(2);
    expect(restoredClock).toBeTruthy();
  });

  it('resetKey returns sub-page back to home', async () => {
    const onSaveTimedSession = jest.fn().mockResolvedValue(undefined);
    const { getByTestId, queryByTestId, rerender } = render(
      <PracticeView
        sessions={[baseSession]}
        onSaveTimedSession={onSaveTimedSession}
        resetKey={0}
      />
    );

    // Navigate to intention stage — Begin button only renders there
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    expect(getByTestId('practice-begin')).toBeTruthy();

    await act(async () => {
      rerender(
        <PracticeView
          sessions={[baseSession]}
          onSaveTimedSession={onSaveTimedSession}
          resetKey={1}
        />
      );
    });

    // Begin gone means stage returned to 'home'
    expect(queryByTestId('practice-begin')).toBeNull();
  });

  it('shows edit intention link on intention screen', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    expect(getByTestId('intention-edit-link')).toBeTruthy();
  });

  it('opens intention editor when edit link is tapped', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('intention-edit-link'));
    expect(getByTestId('intention-edit-box')).toBeTruthy();
    expect(getByTestId('intention-edit-input')).toBeTruthy();
  });

  it('saves custom intention text and shows it after closing editor', async () => {
    const { getByTestId, getByText } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('intention-edit-link'));

    fireEvent.changeText(getByTestId('intention-edit-input'), 'My custom intention text');
    await act(async () => {
      fireEvent.press(getByTestId('intention-edit-save'));
    });

    expect(getByText('My custom intention text')).toBeTruthy();
  });

  it('cancel closes editor without changing intention text', () => {
    const { getByTestId, queryByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('intention-edit-link'));
    fireEvent.changeText(getByTestId('intention-edit-input'), 'Should not be saved');
    fireEvent.press(getByTestId('intention-edit-cancel'));

    expect(queryByTestId('intention-edit-input')).toBeNull();
    expect(getByTestId('intention-edit-link')).toBeTruthy();
  });

  it('restores custom intention from storage on mount', async () => {
    await AsyncStorage.setItem('@kalapa_practice_custom_intention', 'Persisted intention');

    const { findByText, getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));

    await findByText('Persisted intention');
  });

  it('adds bottom padding to scroll content when intention editor is open', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('intention-edit-link'));

    const scrollView = getByTestId('intention-scroll');
    const contentStyle = scrollView.props.contentContainerStyle;
    const flat = Array.isArray(contentStyle)
      ? Object.assign({}, ...contentStyle.filter(Boolean))
      : contentStyle ?? {};
    expect(flat.paddingBottom).toBe(320);
  });

  it('registers keyboard listener when editing and removes it on cancel', () => {
    const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
    const removeMock = jest.fn();
    addListenerSpy.mockReturnValue({ remove: removeMock } as any);

    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('intention-edit-link'));

    expect(addListenerSpy).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));

    fireEvent.press(getByTestId('intention-edit-cancel'));

    expect(removeMock).toHaveBeenCalled();

    addListenerSpy.mockRestore();
  });

  // Helpers to reach the dedication screen
  const reachDedication = (view: ReturnType<typeof setup>) => {
    const { getByTestId } = view;
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('practice-begin'));
    fireEvent.press(getByTestId('practice-end'));
  };

  it('shows edit dedication link on dedication screen', () => {
    const view = setup();
    reachDedication(view);
    expect(view.getByTestId('dedication-edit-link')).toBeTruthy();
  });

  it('opens dedication editor inline when edit link is tapped', () => {
    const view = setup();
    reachDedication(view);
    fireEvent.press(view.getByTestId('dedication-edit-link'));
    expect(view.getByTestId('dedication-edit-input')).toBeTruthy();
  });

  it('saves custom dedication text and shows it after closing editor', async () => {
    const view = setup();
    reachDedication(view);
    fireEvent.press(view.getByTestId('dedication-edit-link'));
    fireEvent.changeText(view.getByTestId('dedication-edit-input'), 'My custom dedication');
    await act(async () => {
      fireEvent.press(view.getByTestId('dedication-edit-save'));
    });
    expect(view.getByText('My custom dedication')).toBeTruthy();
  });

  it('cancel closes dedication editor without changing text', () => {
    const view = setup();
    reachDedication(view);
    fireEvent.press(view.getByTestId('dedication-edit-link'));
    fireEvent.changeText(view.getByTestId('dedication-edit-input'), 'Should not be saved');
    fireEvent.press(view.getByTestId('dedication-edit-cancel'));
    expect(view.queryByTestId('dedication-edit-input')).toBeNull();
    expect(view.getByTestId('dedication-edit-link')).toBeTruthy();
  });

  it('restores custom dedication from storage on mount', async () => {
    await AsyncStorage.setItem('@kalapa_practice_custom_dedication', 'Persisted dedication');
    const view = setup();
    reachDedication(view);
    await view.findByText('Persisted dedication');
  });

  it('adds bottom padding to scroll content when dedication editor is open', () => {
    const view = setup();
    reachDedication(view);
    fireEvent.press(view.getByTestId('dedication-edit-link'));
    const scrollView = view.getByTestId('dedication-scroll');
    const contentStyle = scrollView.props.contentContainerStyle;
    const flat = Array.isArray(contentStyle)
      ? Object.assign({}, ...contentStyle.filter(Boolean))
      : contentStyle ?? {};
    expect(flat.paddingBottom).toBe(320);
  });

  it('registers keyboard listener when editing dedication and removes it on cancel', () => {
    const addListenerSpy = jest.spyOn(Keyboard, 'addListener');
    const removeMock = jest.fn();
    addListenerSpy.mockReturnValue({ remove: removeMock } as any);

    const view = setup();
    reachDedication(view);
    fireEvent.press(view.getByTestId('dedication-edit-link'));

    expect(addListenerSpy).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));

    fireEvent.press(view.getByTestId('dedication-edit-cancel'));
    expect(removeMock).toHaveBeenCalled();

    addListenerSpy.mockRestore();
  });

  const checkTitleStyle = (title: { props: { style: unknown } }) => {
    const style = Array.isArray(title.props.style)
      ? Object.assign({}, ...title.props.style.filter(Boolean))
      : title.props.style ?? {};
    expect(style.color).toBe('#991B1B');
    expect(style.fontWeight).toBe('700');
  };

  it('Select Duration title is bold blue', () => {
    const { getByText, getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    const title = getByText('Select Duration');
    const style = Array.isArray(title.props.style)
      ? Object.assign({}, ...title.props.style.filter(Boolean))
      : title.props.style ?? {};
    expect(style.color).toBe('#1E40AF');
    expect(style.fontWeight).toBe('700');
  });

  it('Mantra Library title is bold blue', () => {
    const { getByText, getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-mantra'));
    const title = getByText('Mantra Library');
    const style = Array.isArray(title.props.style)
      ? Object.assign({}, ...title.props.style.filter(Boolean))
      : title.props.style ?? {};
    expect(style.color).toBe('#1E40AF');
    expect(style.fontWeight).toBe('700');
  });

  it('Set Intention title is bold danger red', () => {
    const { getByText, getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    checkTitleStyle(getByText('Set Intention'));
  });

  it('Dedication title is bold danger red', async () => {
    const { getByText, getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    fireEvent.press(getByTestId('practice-set-intention'));
    fireEvent.press(getByTestId('practice-begin'));
    fireEvent.press(getByTestId('practice-end'));
    checkTitleStyle(getByText('Dedication'));
  });

  it('Rikpa card is not shown when feature is disabled', () => {
    const { queryByTestId } = setup();
    expect(queryByTestId('practice-card-rikpa')).toBeNull();
  });

  it('duration timer clock uses danger red color', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    const clock = getByTestId('practice-detail-clock');
    const style = Array.isArray(clock.props.style)
      ? Object.assign({}, ...clock.props.style.filter(Boolean))
      : clock.props.style ?? {};
    expect(style.color).toBe('#991B1B');
  });

  it('unselected duration pill text uses danger red color', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    // practice-minute-10 is selected by default; check an unselected pill
    const pill = getByTestId('practice-minute-20');
    const textNode = pill.children[0] as { props: { style: unknown } };
    const style = Array.isArray(textNode.props.style)
      ? Object.assign({}, ...textNode.props.style.filter(Boolean))
      : textNode.props.style ?? {};
    expect(style.color).toBe('#991B1B');
  });

  it('adjust +/- button symbols use danger red color', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    const minusText = getByTestId('practice-minus-minute').children[0] as { props: { style: unknown } };
    const style = Array.isArray(minusText.props.style)
      ? Object.assign({}, ...minusText.props.style.filter(Boolean))
      : minusText.props.style ?? {};
    expect(style.color).toBe('#991B1B');
  });

  it('selected duration pill uses danger red background', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-timed'));
    const pill = getByTestId('practice-minute-10');
    const style = Array.isArray(pill.props.style)
      ? Object.assign({}, ...pill.props.style.filter(Boolean))
      : pill.props.style ?? {};
    expect(style.backgroundColor).toBe('#991B1B');
  });

  it('selected mantra target pill uses danger red background', () => {
    const { getByTestId } = setup();
    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-condensed-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-condensed-tara'));
    const pill = getByTestId('practice-mantra-target-108');
    const style = Array.isArray(pill.props.style)
      ? Object.assign({}, ...pill.props.style.filter(Boolean))
      : pill.props.style ?? {};
    expect(style.backgroundColor).toBe('#991B1B');
  });

});
