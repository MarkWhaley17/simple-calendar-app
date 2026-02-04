import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AddEventView from '../../../screens/events/AddEventView';

describe('AddEventView', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore();
  });

  it('shows an alert when title is missing', () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <AddEventView
        onBack={jest.fn()}
        onSave={onSave}
        initialDate={new Date(2026, 1, 10)}
        defaultEventReminderMinutes={15}
        defaultAllDayReminderHours={12}
      />
    );

    fireEvent.press(getByText('Save'));

    expect(Alert.alert).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not alert when title is present', () => {
    const onSave = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <AddEventView
        onBack={jest.fn()}
        onSave={onSave}
        initialDate={new Date(2026, 1, 10)}
        defaultEventReminderMinutes={15}
        defaultAllDayReminderHours={12}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Event title'), 'New Event');
    fireEvent.press(getByText('Save'));

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });
});
