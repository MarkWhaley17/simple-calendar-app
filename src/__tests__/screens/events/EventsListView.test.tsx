import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EventsListView from '../../../screens/events/EventsListView';
import { CalendarEvent } from '../../../types';
import { MONTH_NAMES } from '../../../constants/dates';

describe('EventsListView', () => {
  const mockOnEventPress = jest.fn();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 5);
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 8);
  const currentMonthName = MONTH_NAMES[currentMonth];
  const previousMonthName = MONTH_NAMES[previousMonthDate.getMonth()];
  const nextMonthName = MONTH_NAMES[nextMonthDate.getMonth()];

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'First Event',
      fromDate: new Date(currentYear, currentMonth, 15),
      fromTime: '9:00 AM',
      description: 'First event description',
    },
    {
      id: '2',
      title: 'Second Event',
      fromDate: new Date(currentYear, currentMonth, 20),
      fromTime: '2:00 PM',
      description: 'Second event description',
    },
    {
      id: 'pre-added-3',
      title: 'Third Event',
      fromDate: new Date(currentYear, currentMonth, 10),
      isAllDay: true,
      description: 'All day event',
    },
    {
      id: '4',
      title: 'Previous Month Event',
      fromDate: previousMonthDate,
      fromTime: '10:00 AM',
    },
    {
      id: '5',
      title: 'Next Month Event',
      fromDate: nextMonthDate,
      fromTime: '11:00 AM',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to Preloaded tab and shows only preloaded events for month', () => {
    const { getByText, queryByText } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );

    expect(getByText(`${currentMonthName} ${currentYear}`)).toBeTruthy();
    expect(getByText('1 event')).toBeTruthy();
    expect(getByText('Third Event')).toBeTruthy();
    expect(queryByText('First Event')).toBeNull();
    expect(queryByText('Second Event')).toBeNull();
  });

  it('switches to My Sessions tab and shows personal events', () => {
    const { getByTestId, getByText, queryByText } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );

    fireEvent.press(getByTestId('events-tab-personal'));

    expect(getByText('2 sessions')).toBeTruthy();
    expect(getByText('First Event')).toBeTruthy();
    expect(getByText('Second Event')).toBeTruthy();
    expect(queryByText('Third Event')).toBeNull();
  });

  it('shows full-width preloaded row and personal card variants', () => {
    const { getByTestId } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );

    expect(getByTestId('events-list-preloaded-pre-added-3')).toBeTruthy();
    fireEvent.press(getByTestId('events-tab-personal'));
    expect(getByTestId('events-list-user-1')).toBeTruthy();
  });

  it('shows all-day label for preloaded all-day events', () => {
    const { getByText } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );

    expect(getByText(new RegExp(`${currentMonthName} 10, ${currentYear} • All Day`))).toBeTruthy();
  });

  it('shows personal events in chronological order', () => {
    const { getByTestId, toJSON } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );
    fireEvent.press(getByTestId('events-tab-personal'));

    const serializedTree = JSON.stringify(toJSON());
    expect(serializedTree.indexOf('events-list-user-1')).toBeLessThan(serializedTree.indexOf('events-list-user-2'));
  });

  it('calls onEventPress with correct event from current tab', () => {
    const { getByText, getByTestId } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );

    fireEvent.press(getByText('Third Event'));
    expect(mockOnEventPress).toHaveBeenCalledWith(mockEvents[2]);

    fireEvent.press(getByTestId('events-tab-personal'));
    fireEvent.press(getByText('Second Event'));
    expect(mockOnEventPress).toHaveBeenCalledWith(mockEvents[1]);
  });

  it('shows tab-specific empty states', () => {
    const onlyPersonal: CalendarEvent[] = [{ ...mockEvents[0] }];
    const { getByText, getByTestId } = render(
      <EventsListView events={onlyPersonal} onEventPress={mockOnEventPress} />
    );

    expect(getByText('No preloaded events this month')).toBeTruthy();
    fireEvent.press(getByTestId('events-tab-personal'));
    expect(getByText('First Event')).toBeTruthy();
  });

  it('swipes left to next month and updates month title', async () => {
    const { getByTestId, getByText } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );
    const swipeArea = getByTestId('events-list-swipe-area');

    fireEvent(swipeArea, 'touchStart', { nativeEvent: { pageX: 240, pageY: 300 } });
    fireEvent(swipeArea, 'touchEnd', { nativeEvent: { pageX: 120, pageY: 305 } });

    await waitFor(() => {
      expect(getByText(`${nextMonthName} ${nextMonthDate.getFullYear()}`)).toBeTruthy();
    });
  });

  it('header arrows change months', async () => {
    const { getByTestId, getByText } = render(
      <EventsListView events={mockEvents} onEventPress={mockOnEventPress} />
    );

    fireEvent.press(getByTestId('events-header-prev-month'));
    await waitFor(() => {
      expect(getByText(`${previousMonthName} ${previousMonthDate.getFullYear()}`)).toBeTruthy();
    });
  });
});
