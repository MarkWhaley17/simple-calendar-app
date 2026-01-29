import React from 'react';
import { render } from '@testing-library/react-native';
import EditEventView from '../../../screens/events/EditEventView';
import { CalendarEvent } from '../../../types';

const baseEvent: CalendarEvent = {
  id: 'event-1',
  title: 'Test Event',
  fromDate: new Date(2026, 0, 8),
  fromTime: '9:00 AM',
  toDate: new Date(2026, 0, 8),
  toTime: '10:00 AM',
  isAllDay: false,
  recurrence: { frequency: 'weekly', interval: 1 },
};

describe('EditEventView', () => {
  it('shows recurring notice by default for recurring events', () => {
    const { getByText } = render(
      <EditEventView
        event={baseEvent}
        onBack={jest.fn()}
        onSave={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(
      getByText('Editing this recurring event will update all future occurrences.')
    ).toBeTruthy();
  });

  it('hides recurring notice when showRecurringNotice is false', () => {
    const { queryByText } = render(
      <EditEventView
        event={baseEvent}
        onBack={jest.fn()}
        onSave={jest.fn()}
        onDelete={jest.fn()}
        showRecurringNotice={false}
      />
    );

    expect(
      queryByText('Editing this recurring event will update all future occurrences.')
    ).toBeNull();
  });
});
