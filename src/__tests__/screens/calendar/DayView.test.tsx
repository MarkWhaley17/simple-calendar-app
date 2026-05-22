import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import DayView from '../../../screens/calendar/DayView';
import { CalendarEvent } from '../../../types';

jest.mock('../../../../assets/dakini.jpg', () => 98765);
jest.mock('../../../../assets/jambhala.jpg', () => 87654);

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

    const background = getByTestId('day-view-events-background');
    expect(background).toHaveStyle({ opacity: 0.25 });
  });

  it('uses a non-repeating background pattern', () => {
    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 1, 10)}
        onBack={jest.fn()}
        events={[]}
      />
    );

    expect(getByTestId('day-view-events-background').props.resizeMode).toBe('cover');
  });

  it('centers the background pattern', () => {
    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 1, 10)}
        onBack={jest.fn()}
        events={[]}
      />
    );

    const background = getByTestId('day-view-events-background');
    expect(background).toHaveStyle({ transform: [{ translateX: -120 }, { translateY: -180 }, { scale: 1 }] });
  });

  it('shows a date range instead of "All Day" for multi-day all-day events', () => {
    const event: CalendarEvent = {
      id: 'event-range',
      title: 'VY Nepal Pilgrimage',
      fromDate: new Date(2026, 2, 12),
      toDate: new Date(2026, 2, 21),
      isAllDay: true,
    };

    const { getByText, queryByText } = render(
      <DayView
        selectedDate={new Date(2026, 2, 15)}
        onBack={jest.fn()}
        events={[event]}
      />
    );

    expect(getByText('March 12 - March 21')).toBeTruthy();
    expect(queryByText('All Day')).toBeNull();
  });

  it('uses the FullMoon banner image on full moon days', () => {
    const fullMoonEvent: CalendarEvent = {
      id: 'event-full-moon',
      title: 'Full Moon King of Ling Lhasang',
      fromDate: new Date(2026, 2, 14),
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 2, 14)}
        onBack={jest.fn()}
        events={[fullMoonEvent]}
      />
    );

    expect(getByTestId('day-view-header-image').props.source).toBe(
      require('../../../../assets/full-moon.png')
    );
  });

  it('uses the NewMoon banner image on new moon days', () => {
    const newMoonEvent: CalendarEvent = {
      id: 'event-new-moon',
      title: 'New Moon',
      fromDate: new Date(2026, 2, 10),
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 2, 10)}
        onBack={jest.fn()}
        events={[newMoonEvent]}
      />
    );

    expect(getByTestId('day-view-header-image').props.source).toBe(
      require('../../../../assets/new-moon.png')
    );
  });

  it('uses the Dakini banner image on dakini days', () => {
    const dakiniEvent: CalendarEvent = {
      id: 'event-dakini-day',
      title: 'Dakini Day',
      fromDate: new Date(2026, 3, 2),
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 3, 2)}
        onBack={jest.fn()}
        events={[dakiniEvent]}
      />
    );

    expect(getByTestId('day-view-header-image').props.source).toBe(
      require('../../../../assets/dakini.jpg')
    );
  });

  it('uses the Jambhala banner image on jambhala days', () => {
    const jambhalaEvent: CalendarEvent = {
      id: 'event-jambhala-day',
      title: 'Jambhala Day',
      fromDate: new Date(2026, 3, 10),
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 3, 10)}
        onBack={jest.fn()}
        events={[jambhalaEvent]}
      />
    );

    expect(getByTestId('day-view-header-image').props.source).toBe(
      require('../../../../assets/jambhala.jpg')
    );
  });

  it('shows same-day events even when the event date includes a time component', () => {
    const timedEvent: CalendarEvent = {
      id: 'event-time-component',
      title: 'Evening Practice',
      fromDate: new Date(2026, 2, 10, 18, 0, 0),
      toDate: new Date(2026, 2, 10, 18, 0, 0),
      fromTime: '6:00 PM',
      isAllDay: false,
    };

    const { getByText } = render(
      <DayView
        selectedDate={new Date(2026, 2, 10, 0, 0, 0)}
        onBack={jest.fn()}
        events={[timedEvent]}
      />
    );

    expect(getByText('Evening Practice')).toBeTruthy();
  });

  it('event time subtitle uses danger red at 0.7 opacity', () => {
    const event: CalendarEvent = {
      id: 'event-time-opacity',
      title: 'Morning Session',
      fromDate: new Date(2026, 2, 10, 9, 0, 0),
      fromTime: '9:00 AM',
      isAllDay: false,
    };
    const { getByText } = render(
      <DayView selectedDate={new Date(2026, 2, 10)} onBack={jest.fn()} events={[event]} />
    );
    const timeLabel = getByText('9:00 AM');
    const style = Array.isArray(timeLabel.props.style)
      ? Object.assign({}, ...timeLabel.props.style.filter(Boolean))
      : timeLabel.props.style ?? {};
    expect(style.color).toBe('#991B1B');
    expect(style.opacity).toBe(0.7);
  });

  it('prioritizes non-Medicine-Buddha header image on conflict days', () => {
    const medicineEvent: CalendarEvent = {
      id: 'event-medicine',
      title: 'Medicine Buddha Day',
      fromDate: new Date(2026, 2, 26),
      image: 'medicine-buddha.jpg',
      isAllDay: true,
    };
    const protectorEvent: CalendarEvent = {
      id: 'event-protector',
      title: 'Protector Day',
      fromDate: new Date(2026, 2, 26),
      image: 'protector-day.jpg',
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 2, 26)}
        onBack={jest.fn()}
        events={[medicineEvent, protectorEvent]}
      />
    );

    expect(getByTestId('day-view-header-image').props.source).toBe(
      require('../../../../assets/protector-day.jpg')
    );
  });

  it('renders Medicine Buddha Day under other event items on conflict days', () => {
    const medicineEvent: CalendarEvent = {
      id: 'event-medicine',
      title: 'Medicine Buddha Day',
      fromDate: new Date(2026, 2, 26),
      image: 'medicine-buddha.jpg',
      isAllDay: true,
    };
    const protectorEvent: CalendarEvent = {
      id: 'event-protector',
      title: 'Protector Day',
      fromDate: new Date(2026, 2, 26),
      image: 'protector-day.jpg',
      isAllDay: true,
    };

    const screen = render(
      <DayView
        selectedDate={new Date(2026, 2, 26)}
        onBack={jest.fn()}
        events={[medicineEvent, protectorEvent]}
      />
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree.indexOf('Protector Day')).toBeGreaterThan(-1);
    expect(tree.indexOf('Medicine Buddha Day')).toBeGreaterThan(-1);
    expect(tree.indexOf('Protector Day')).toBeLessThan(tree.indexOf('Medicine Buddha Day'));
  });

  it('renders event items and session items as full-width rows', () => {
    const eventItem: CalendarEvent = {
      id: 'event-public-1',
      title: 'Preloaded Event',
      fromDate: new Date(2026, 2, 10),
      isAllDay: true,
    };
    const sessionItem: CalendarEvent = {
      id: 'session-1',
      title: 'User Event',
      fromDate: new Date(2026, 2, 10),
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 2, 10)}
        onBack={jest.fn()}
        events={[eventItem, sessionItem]}
      />
    );

    expect(getByTestId('day-event-event-event-public-1')).toHaveStyle({ marginBottom: 14 });
    expect(getByTestId('day-event-session-session-1')).toHaveStyle({ marginBottom: 14 });
  });

  it('opens session options on long press for session rows only', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const onSessionEdit = jest.fn();
    const onSessionDelete = jest.fn();
    const onEventPress = jest.fn();
    const eventItem: CalendarEvent = {
      id: 'event-public-1',
      title: 'Preloaded Event',
      fromDate: new Date(2026, 2, 10),
      isAllDay: true,
    };
    const sessionItem: CalendarEvent = {
      id: 'session-1',
      title: 'User Event',
      fromDate: new Date(2026, 2, 10),
      isAllDay: true,
    };

    const { getByTestId } = render(
      <DayView
        selectedDate={new Date(2026, 2, 10)}
        onBack={jest.fn()}
        events={[eventItem, sessionItem]}
        onEventPress={onEventPress}
        onSessionEdit={onSessionEdit}
        onSessionDelete={onSessionDelete}
      />
    );

    fireEvent(getByTestId('day-event-session-session-1'), 'longPress');
    expect(alertSpy).toHaveBeenCalledWith(
      'Session Options',
      undefined,
      expect.arrayContaining([
        expect.objectContaining({ text: 'Edit' }),
        expect.objectContaining({ text: 'Delete', style: 'destructive' }),
      ])
    );

    fireEvent(getByTestId('day-event-event-event-public-1'), 'longPress');
    expect(alertSpy).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });
});
