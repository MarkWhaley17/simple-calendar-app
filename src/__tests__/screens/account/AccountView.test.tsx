import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccountView from '../../../screens/account/AccountView';
import { NotificationSettings } from '../../../types';

describe('AccountView', () => {
  const mockOnUpdateNotificationSettings = jest.fn();

  const mockNotificationSettings: NotificationSettings = {
    practiceDayReminders: true,
    eventReminders: true,
    dailyQuoteNotifications: false,
    eventReminderMinutes: 30,
    allDayReminderHours: 9,
  };

  const defaultProps = {
    notificationSettings: mockNotificationSettings,
    onUpdateNotificationSettings: mockOnUpdateNotificationSettings,
    settingsReady: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile section', () => {
    it('should show Sign In button when logged out', () => {
      const { getByText } = render(<AccountView {...defaultProps} />);
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should not show Create Account button', () => {
      const { queryByText } = render(<AccountView {...defaultProps} />);
      expect(queryByText('Create Account')).toBeNull();
    });

    it('should not show Sign Out button when logged out', () => {
      const { queryByText } = render(<AccountView {...defaultProps} />);
      expect(queryByText('Sign Out')).toBeNull();
    });

    it('should show Sign Out button after signing in', () => {
      const { getByText } = render(<AccountView {...defaultProps} />);
      fireEvent.press(getByText('Sign In'));
      expect(getByText('Sign Out')).toBeTruthy();
    });

    it('should not show Sign In button when logged in', () => {
      const { getByText, queryByText } = render(<AccountView {...defaultProps} />);
      fireEvent.press(getByText('Sign In'));
      expect(queryByText('Sign In')).toBeNull();
    });

    it('should return to Sign In after signing out', () => {
      const { getByText } = render(<AccountView {...defaultProps} />);
      fireEvent.press(getByText('Sign In'));
      fireEvent.press(getByText('Sign Out'));
      expect(getByText('Sign In')).toBeTruthy();
    });
  });
});
