import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import PracticeView from '../../../screens/practice/PracticeView';
import { CalendarEvent } from '../../../types';

describe('PracticeView', () => {
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
    const onSessionPress = jest.fn();
    const onSaveTimedSession = jest.fn().mockResolvedValue(undefined);
    const view = render(
      <PracticeView
        sessions={sessions}
        onSessionPress={onSessionPress}
        onSaveTimedSession={onSaveTimedSession}
      />
    );
    return {
      ...view,
      onSessionPress,
      onSaveTimedSession,
    };
  };

  it('renders dashboard, cards, and history list', () => {
    const { getByText, getByTestId, getAllByText } = setup();

    expect(getByText('Practice')).toBeTruthy();
    expect(getAllByText('Timed Meditation').length).toBeGreaterThan(0);
    expect(getByText('Session History')).toBeTruthy();
    expect(getByTestId('practice-history-session-1')).toBeTruthy();
  });

  it('opens timer detail from card and updates time using preset and +/- controls', () => {
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('practice-card-timed'));
    expect(getByTestId('practice-set-intention')).toBeTruthy();

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
    fireEvent.press(getByTestId('practice-dedication-return'));

    expect(getByTestId('practice-accumulations-input')).toBeTruthy();
    fireEvent.changeText(getByTestId('practice-accumulations-input'), '5');
    fireEvent.press(getByTestId('practice-accumulations-save'));

    await waitFor(() => {
      expect(onSaveTimedSession).toHaveBeenCalledTimes(1);
    });

    expect(onSaveTimedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        durationSec: expect.any(Number),
        accumulations: 5,
      })
    );
    expect(getByText('Session History')).toBeTruthy();
  });

  it('opens existing session detail when history row is pressed', () => {
    const { getByTestId, onSessionPress } = setup();

    fireEvent.press(getByTestId('practice-history-session-1'));
    expect(onSessionPress).toHaveBeenCalledWith(baseSession);
  });
});
