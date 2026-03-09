import React from 'react';
import { render } from '@testing-library/react-native';
import EditEventView from '../../../screens/events/EditEventView';
import { CalendarEvent } from '../../../types';

describe('EditEventView pre-loaded lock behavior', () => {
  const mockOnBack = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();

  const renderView = (event: CalendarEvent) =>
    render(
      <EditEventView
        event={event}
        onBack={mockOnBack}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        defaultEventReminderMinutes={30}
        defaultAllDayReminderHours={6}
      />
    );

  it('locks core fields for pre-loaded events and keeps only links editable', () => {
    const event: CalendarEvent = {
      id: 'pre-added-1',
      title: 'Preloaded Event',
      description: 'Original',
      fromDate: new Date(2026, 2, 5),
      fromTime: '8:00 AM',
      toDate: new Date(2026, 2, 5),
      toTime: '9:00 AM',
      links: ['https://example.com'],
      isAllDay: false,
    };

    const { getByTestId, getByText, queryByText } = renderView(event);

    expect(getByText('This pre-loaded event is locked. You can edit links only.')).toBeTruthy();
    expect(getByTestId('edit-title-input').props.editable).toBe(false);
    expect(getByTestId('edit-from-date-button').props.accessibilityState.disabled).toBe(true);
    expect(getByTestId('edit-to-date-button').props.accessibilityState.disabled).toBe(true);
    expect(getByTestId('edit-repeat-button').props.accessibilityState.disabled).toBe(true);
    expect(getByTestId('edit-description-input').props.editable).toBe(false);
    expect(getByTestId('edit-links-input').props.editable).not.toBe(false);
    expect(queryByText('Delete Event')).toBeNull();
  });

  it('keeps full edit controls for user-created events', () => {
    const event: CalendarEvent = {
      id: 'custom-1',
      title: 'User Event',
      description: '',
      fromDate: new Date(2026, 2, 5),
      fromTime: '8:00 AM',
      toDate: new Date(2026, 2, 5),
      toTime: '9:00 AM',
      links: [],
      isAllDay: false,
    };

    const { getByTestId, queryByText } = renderView(event);

    expect(getByTestId('edit-title-input').props.editable).not.toBe(false);
    expect(getByTestId('edit-from-date-button').props.accessibilityState.disabled).toBe(false);
    expect(getByTestId('edit-to-date-button').props.accessibilityState.disabled).toBe(false);
    expect(getByTestId('edit-repeat-button').props.accessibilityState.disabled).toBe(false);
    expect(queryByText('Delete Event')).toBeTruthy();
  });

  it('keeps notes input and scroll settings keyboard-friendly', () => {
    const event: CalendarEvent = {
      id: 'custom-2',
      title: 'User Event',
      description: '',
      fromDate: new Date(2026, 2, 5),
      fromTime: '8:00 AM',
      toDate: new Date(2026, 2, 5),
      toTime: '9:00 AM',
      links: [],
      isAllDay: false,
    };

    const { getByTestId } = renderView(event);
    const notesInput = getByTestId('edit-links-input');
    const scrollView = getByTestId('edit-event-scrollview');

    expect(notesInput.props.multiline).toBe(true);
    expect(notesInput.props.blurOnSubmit).toBe(false);
    expect(notesInput.props.submitBehavior).toBe('newline');
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scrollView.props.keyboardDismissMode).toBe('none');
    expect(scrollView.props.automaticallyAdjustKeyboardInsets).toBe(true);
  });
});
