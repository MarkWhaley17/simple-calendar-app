import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountView from '../../../screens/account/AccountView';
import { NotificationSettings, AuthUser } from '../../../types';
import * as auth from '../../../utils/auth';

jest.mock('../../../utils/auth');

describe('AccountView', () => {
  const mockOnUpdateNotificationSettings = jest.fn();
  const mockOnUserChange = jest.fn();
  const mockOnOpenRecordings = jest.fn();
  const mockOnOpenPrivacyPolicy = jest.fn();
  const mockOnOpenTermsOfService = jest.fn();
  const mockOnOpenFeedback = jest.fn();

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
    user: null,
    onUserChange: mockOnUserChange,
    onOpenRecordings: mockOnOpenRecordings,
    onOpenPrivacyPolicy: mockOnOpenPrivacyPolicy,
    onOpenTermsOfService: mockOnOpenTermsOfService,
    onOpenFeedback: mockOnOpenFeedback,
  };

  const signedInUser: AuthUser = {
    email: 'marktwhaley',
    displayName: 'Mark Whaley',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signed-out state', () => {
    it('shows username and password inputs', () => {
      const { getByPlaceholderText } = render(<AccountView {...defaultProps} />);
      expect(getByPlaceholderText('Username')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('shows Sign In button', () => {
      const { getByText } = render(<AccountView {...defaultProps} />);
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('shows Open My Recordings button', () => {
      const { getByText } = render(<AccountView {...defaultProps} />);
      expect(getByText('Open My Recordings')).toBeTruthy();
    });

    it('does not show Sign Out button', () => {
      const { queryByText } = render(<AccountView {...defaultProps} />);
      expect(queryByText('Sign Out')).toBeNull();
    });

    it('shows error when Sign In pressed with empty fields', async () => {
      const { getByText } = render(<AccountView {...defaultProps} />);
      fireEvent.press(getByText('Sign In'));
      await waitFor(() => {
        expect(getByText('Please enter your username and password.')).toBeTruthy();
      });
    });

    it('calls login and onUserChange on successful sign in', async () => {
      (auth.login as jest.Mock).mockResolvedValueOnce(signedInUser);

      const { getByPlaceholderText, getByText } = render(<AccountView {...defaultProps} />);
      fireEvent.changeText(getByPlaceholderText('Username'), 'marktwhaley');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(auth.login).toHaveBeenCalledWith('marktwhaley', 'password123');
        expect(mockOnUserChange).toHaveBeenCalledWith(signedInUser);
      });
    });

    it('shows error message on failed login', async () => {
      (auth.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid username or password.'));

      const { getByPlaceholderText, getByText } = render(<AccountView {...defaultProps} />);
      fireEvent.changeText(getByPlaceholderText('Username'), 'bad');
      fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(getByText('Invalid username or password.')).toBeTruthy();
      });
    });
  });

  describe('signed-in state', () => {
    it('shows display name and username when user prop is set', () => {
      const { getByText } = render(<AccountView {...defaultProps} user={signedInUser} />);
      expect(getByText('Mark Whaley')).toBeTruthy();
      expect(getByText('@marktwhaley')).toBeTruthy();
    });

    it('shows Sign Out button', () => {
      const { getByText } = render(<AccountView {...defaultProps} user={signedInUser} />);
      expect(getByText('Sign Out')).toBeTruthy();
    });

    it('does not show Sign In button', () => {
      const { queryByText } = render(<AccountView {...defaultProps} user={signedInUser} />);
      expect(queryByText('Sign In')).toBeNull();
    });

    it('calls logout and onUserChange(null) on sign out', async () => {
      (auth.logout as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByText } = render(<AccountView {...defaultProps} user={signedInUser} />);
      fireEvent.press(getByText('Sign Out'));

      await waitFor(() => {
        expect(auth.logout).toHaveBeenCalled();
        expect(mockOnUserChange).toHaveBeenCalledWith(null);
      });
    });

    it('calls onOpenRecordings when My Recordings button is pressed', () => {
      const { getByTestId } = render(<AccountView {...defaultProps} user={signedInUser} />);
      fireEvent.press(getByTestId('open-recordings-button'));
      expect(mockOnOpenRecordings).toHaveBeenCalledTimes(1);
    });

    it('opens privacy policy page from About section', () => {
      const { getByTestId } = render(<AccountView {...defaultProps} user={signedInUser} />);
      fireEvent.press(getByTestId('open-privacy-policy'));
      expect(mockOnOpenPrivacyPolicy).toHaveBeenCalledTimes(1);
    });

    it('opens terms of service page from About section', () => {
      const { getByTestId } = render(<AccountView {...defaultProps} user={signedInUser} />);
      fireEvent.press(getByTestId('open-terms-of-service'));
      expect(mockOnOpenTermsOfService).toHaveBeenCalledTimes(1);
    });

    it('opens feedback page from About section', () => {
      const { getByTestId } = render(<AccountView {...defaultProps} user={signedInUser} />);
      fireEvent.press(getByTestId('open-feedback'));
      expect(mockOnOpenFeedback).toHaveBeenCalledTimes(1);
    });
  });
});
