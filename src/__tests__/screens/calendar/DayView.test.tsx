import React from 'react';
import { render } from '@testing-library/react-native';
import DayView from '../../../screens/calendar/DayView';
import { CalendarEvent } from '../../../types';

describe('DayView', () => {
  it('renders the header image and event list background pattern', () => {
    const event: CalendarEvent = {
      id: 'event-1',
      title: 'Test Event',
      fromDate: new Date(2026, 1, 10),
      image: 'medicine-buddha.jpg',
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 1, 10)}
        onBack={jest.fn()}
        events={[event]}
      />
    );

    expect(getByTestId('day-view-header-image')).toBeTruthy();
    expect(getByTestId('day-view-events-background')).toBeTruthy();
  });

  it('uses a lighter opacity for the event list background', () => {
    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 1, 10)}
        onBack={jest.fn()}
        events={[]}
      />
    );

    expect(getByTestId('day-view-events-background')).toHaveStyle({ opacity: 0.25 });
  });
});
