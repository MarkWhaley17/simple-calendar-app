import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EventView from '../../../screens/events/EventView';
import { CalendarEvent } from '../../../types';

describe('EventView', () => {
  const mockOnBack = jest.fn();
  const mockOnEdit = jest.fn();

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

  it('should render links when provided', () => {
    const { getByText } = render(
      <EventView event={mockEvent} onBack={mockOnBack} />
    );

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

    expect(queryByText('Links')).toBeNull();
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
});
