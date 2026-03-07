import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import FeedbackView from '../../../screens/account/FeedbackView';
import { submitFeedback } from '../../../utils/feedback';

jest.mock('../../../utils/feedback', () => ({
  submitFeedback: jest.fn(),
}));

describe('FeedbackView', () => {
  const onBack = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  const mockedSubmitFeedback = submitFeedback as jest.MockedFunction<typeof submitFeedback>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation alert if subject or message is missing', async () => {
    const { getByTestId } = render(<FeedbackView onBack={onBack} user={null} />);
    fireEvent.press(getByTestId('submit-feedback'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Missing details', 'Please enter both a subject and message.');
    });
  });

  it('submits feedback and shows success alert', async () => {
    mockedSubmitFeedback.mockResolvedValueOnce(undefined);
    const user = { displayName: 'Mark', email: 'mark@example.com' };
    const { getByPlaceholderText, getByTestId } = render(<FeedbackView onBack={onBack} user={user} />);

    fireEvent.changeText(getByPlaceholderText('Subject'), 'App feedback');
    fireEvent.changeText(getByPlaceholderText('Message'), 'Love the new recordings flow.');
    fireEvent.press(getByTestId('submit-feedback'));

    await waitFor(() => {
      expect(mockedSubmitFeedback).toHaveBeenCalledWith({
        message: 'Love the new recordings flow.',
        subject: 'App feedback',
        user,
      });
      expect(alertSpy).toHaveBeenCalledWith('Thanks for the feedback', 'Your feedback was sent successfully.');
    });
  });

  it('shows error alert when submit fails', async () => {
    mockedSubmitFeedback.mockRejectedValueOnce(new Error('Could not submit feedback.'));

    const { getByPlaceholderText, getByTestId } = render(<FeedbackView onBack={onBack} user={null} />);
    fireEvent.changeText(getByPlaceholderText('Subject'), 'App feedback');
    fireEvent.changeText(getByPlaceholderText('Message'), 'Please add dark mode.');
    fireEvent.press(getByTestId('submit-feedback'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Submit failed', 'Could not submit feedback.');
    });
  });
});
