import React from 'react';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { Alert } from 'react-native';
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

  it('runs mantra counter flow from library to recitation counting', () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    expect(getByText('Mantra Library')).toBeTruthy();

    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));

    expect(getByText('Green Tara')).toBeTruthy();
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));

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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
    fireEvent.press(getByTestId('practice-mantra-target-108'));
    fireEvent.press(getByTestId('practice-mantra-set-intention'));
    fireEvent.press(getByTestId('practice-mantra-start'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-mantra-counter-button'));
    fireEvent.press(getByTestId('practice-back'));

    expect(getByTestId('practice-mantra-in-progress-tara')).toBeTruthy();
    expect(getByText('In Progress Green Tara Mantra')).toBeTruthy();
    expect(getByText('Target: 108, Done: 2')).toBeTruthy();
  });

  it('keeps in-progress mantra row after finishing early and returning to library', async () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    expect(getByTestId('practice-mantra-in-progress-tara')).toBeTruthy();
    expect(getByText('Target: 108, Done: 2')).toBeTruthy();
  });

  it('opens set intention then resumes mantra session from in-progress row', async () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-in-progress-tara'));

    expect(getByText('Set Intention')).toBeTruthy();
    fireEvent.press(getByTestId('practice-mantra-start'));
    expect(getByTestId('practice-mantra-counter-value').props.children).toBe(2);
  });

  it('shows overwrite warning when adding a mantra with in-progress progress', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Session In Progress',
      'Are you sure you want to start a fresh Green Tara session? This will overwrite your progress towards your existing goal.',
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));

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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));

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
    const linkedWithAccumulations: CalendarEvent = {
      id: 'session-2',
      title: 'Linked Mantra Session',
      fromDate: new Date(2026, 2, 20, 8, 0, 0),
      toDate: new Date(2026, 2, 20, 8, 15, 0),
      accumulations: 9,
    };
    const { getByTestId, getByText, onSaveTimedSession } = setup([baseSession, linkedWithAccumulations]);

    fireEvent.press(getByTestId('practice-card-mantra'));
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(getByTestId('practice-mantra-card-tara'));
    fireEvent.press(getByTestId('practice-mantra-add-tara'));
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
    fireEvent.press(firstMount.getByTestId('practice-mantra-card-tara'));
    fireEvent.press(firstMount.getByTestId('practice-mantra-add-tara'));
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

});
