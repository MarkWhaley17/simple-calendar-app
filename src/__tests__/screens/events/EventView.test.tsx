import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EventView from '../../../screens/events/EventView';
import { CalendarEvent } from '../../../types';

describe('EventView', () => {
  const mockOnBack = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnAddNotes = jest.fn();

  const mockEvent: CalendarEvent = {
    id: '1',
    title: 'Test Event',
    description: 'This is a test event description',
    fromDate: new Date(2026, 1, 18),
    fromTime: '9:00 AM',
    links: ['https://example.com', 'https://google.com'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render event title', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

    expect(getByText('Test Event')).toBeTruthy();
  });

  it('should render event description', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

    expect(getByText('This is a test event description')).toBeTruthy();
  });

  it('should render event date and time', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

    expect(getByText(/February 18, 2026/)).toBeTruthy();
    expect(getByText(/9:00 AM/)).toBeTruthy();
  });

  it('should render notes when provided', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

    expect(getByText('Notes')).toBeTruthy();
    expect(getByText('https://example.com')).toBeTruthy();
    expect(getByText('https://google.com')).toBeTruthy();
  });

  it('should call onBack when back button pressed', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

    fireEvent.press(getByText('‹ Back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should show edit button when onEdit provided', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} onEdit={mockOnEdit} />
    );

    expect(getByText('Edit')).toBeTruthy();
  });

  it('should call onEdit when edit button pressed', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} onEdit={mockOnEdit} />
    );

    fireEvent.press(getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should not show edit button when onEdit not provided', () => {
    const { queryByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

    expect(queryByText('Edit')).toBeNull();
  });

  it('shows Add Notes button for event items when onAddNotes is provided', () => {
    const eventItem: CalendarEvent = {
      ...mockEvent,
      id: 'event-public-123',
    };

    const { getByText, queryByText } = render(
      <EventView
        event={eventItem}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onAddNotes={mockOnAddNotes}
      />
    );

    expect(getByText('Add Notes')).toBeTruthy();
    expect(queryByText('Edit')).toBeNull();
  });

  it('calls onAddNotes for event-item action button', () => {
    const eventItem: CalendarEvent = {
      ...mockEvent,
      id: 'event-member-55',
    };

    const { getByText } = render(
      <EventView
        event={eventItem}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onAddNotes={mockOnAddNotes}
      />
    );

    fireEvent.press(getByText('Add Notes'));
    expect(mockOnAddNotes).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('should show "No description available" when description is missing', () => {
    const eventNoDescription: CalendarEvent = {
      ...mockEvent,
      description: undefined,
    };

    const { getByText } = render(
      <EventView event={eventNoDescription} onBack={mockOnBack} />
    );

    expect(getByText('No description available')).toBeTruthy();
  });

  it('should not show links section when no links provided', () => {
    const eventNoLinks: CalendarEvent = {
      ...mockEvent,
      links: undefined,
    };

    const { queryByText } = render(
      <EventView event={eventNoLinks} onBack={mockOnBack} />
    );

    expect(queryByText('Notes')).toBeNull();
  });

  it('shows accumulations when provided', () => {
    const withAccumulations: CalendarEvent = {
      ...mockEvent,
      accumulations: 108,
    };

    const { getByText } = render(
      <EventView event={withAccumulations} onBack={mockOnBack} />
    );

    expect(getByText('Accumulations')).toBeTruthy();
    expect(getByText('108')).toBeTruthy();
  });

  it('does not show accumulations section when missing', () => {
    const withoutAccumulations: CalendarEvent = {
      ...mockEvent,
      accumulations: undefined,
    };

    const { queryByText } = render(
      <EventView event={withoutAccumulations} onBack={mockOnBack} />
    );

    expect(queryByText('Accumulations')).toBeNull();
  });

  it('should handle legacy date field', () => {
    const legacyEvent: CalendarEvent = {
      id: '2',
      title: 'Legacy Event',
      date: new Date(2026, 2, 15),
      startTime: '10:00 AM',
      fromDate: new Date(2026, 2, 15),
    };

    const { getByText } = render(
      <EventView event={legacyEvent} onBack={mockOnBack} />
    );

    expect(getByText(/March 15, 2026/)).toBeTruthy();
    expect(getByText(/10:00 AM/)).toBeTruthy();
  });

  it('shows a date range in subtitle for multi-day event items', () => {
    const eventItemMultiDay: CalendarEvent = {
      ...mockEvent,
      id: 'event-public-77',
      fromDate: new Date(2026, 2, 3),
      toDate: new Date(2026, 2, 5),
      fromTime: undefined,
      startTime: undefined,
    };

    const { getByText } = render(
      <EventView event={eventItemMultiDay} onBack={mockOnBack} onAddNotes={mockOnAddNotes} />
    );

    expect(getByText('March 3, 2026 - March 5, 2026')).toBeTruthy();
  });

  it('shows a date range in subtitle for multi-day session items', () => {
    const sessionItemMultiDay: CalendarEvent = {
      ...mockEvent,
      id: 'session-1234',
      fromDate: new Date(2026, 2, 3),
      toDate: new Date(2026, 2, 5),
      fromTime: '9:00 AM',
    };

    const { getByText, queryByText } = render(
      <EventView event={sessionItemMultiDay} onBack={mockOnBack} onEdit={mockOnEdit} />
    );

    expect(getByText('March 3, 2026 - March 5, 2026')).toBeTruthy();
    expect(queryByText('March 3, 2026 • 9:00 AM')).toBeNull();
  });
});
