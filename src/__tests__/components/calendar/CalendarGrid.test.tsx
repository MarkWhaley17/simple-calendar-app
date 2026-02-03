import React from 'react';
import { render } from '@testing-library/react-native';
import CalendarGrid from '../../../components/calendar/CalendarGrid';
import { CalendarEvent } from '../../../types';

describe('CalendarGrid', () => {
  it('renders multi-day lines across the range', () => {
    const currentDate = new Date(2026, 1, 1); // February 2026
    const events: CalendarEvent[] = [
      {
        id: 'multi-1',
        title: 'Multi-day',
        fromDate: new Date(2026, 1, 7),
        toDate: new Date(2026, 1, 17),
        isAllDay: true,
      },
    ];

    const { getByTestId } = render(
      <CalendarGrid currentDate={currentDate} events={events} />
    );

    expect(getByTestId('multi-day-line-2026-1-7')).toBeTruthy();
    expect(getByTestId('multi-day-line-2026-1-10')).toBeTruthy();
    expect(getByTestId('multi-day-line-2026-1-17')).toBeTruthy();
  });

  it('shows a red dot only when there is a non-multi-day event', () => {
    const currentDate = new Date(2026, 1, 1); // February 2026
    const events: CalendarEvent[] = [
      {
        id: 'multi-1',
        title: 'Multi-day',
        fromDate: new Date(2026, 1, 7),
        toDate: new Date(2026, 1, 17),
        isAllDay: true,
      },
      {
        id: 'single-1',
        title: 'Single-day',
        fromDate: new Date(2026, 1, 10),
        isAllDay: true,
      },
    ];

    const { getByTestId, queryByTestId } = render(
      <CalendarGrid currentDate={currentDate} events={events} />
    );

    expect(queryByTestId('event-indicator-2026-1-8')).toBeNull();
    expect(getByTestId('event-indicator-2026-1-10')).toBeTruthy();
  });
});
