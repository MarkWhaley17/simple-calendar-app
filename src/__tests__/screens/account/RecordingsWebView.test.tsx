import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import RecordingsWebView from '../../../screens/account/RecordingsWebView';

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');

  return {
    WebView: ({ source, onError, onLoadEnd }: any) => (
      <View testID="webview-mock">
        <Text testID="webview-source">{source?.uri ?? ''}</Text>
        <TouchableOpacity testID="webview-trigger-error" onPress={() => onError?.({})}>
          <Text>Trigger error</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="webview-trigger-load-end" onPress={() => onLoadEnd?.({})}>
          <Text>Trigger load end</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

describe('RecordingsWebView', () => {
  const onBack = jest.fn();
  const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads wp-login with redirect_to recordings page', () => {
    const { getByTestId } = render(<RecordingsWebView onBack={onBack} />);
    const expected = 'https://kalapamedia.com/wp-login.php?redirect_to=https%3A%2F%2Fkalapamedia.com%2Fmy-recordings%2F';
    expect(getByTestId('webview-source').props.children).toBe(expected);
  });

  it('calls onBack when back is pressed', () => {
    const { getByText } = render(<RecordingsWebView onBack={onBack} />);
    fireEvent.press(getByText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('opens recordings page in external browser', async () => {
    const { getByText } = render(<RecordingsWebView onBack={onBack} />);
    fireEvent.press(getByText('Browser'));

    await waitFor(() => {
      expect(openUrlSpy).toHaveBeenCalledWith('https://kalapamedia.com/my-recordings/');
    });
  });

  it('shows retry state when webview errors and returns to webview on retry', () => {
    const { getByTestId, getByText, queryByText, queryByTestId } = render(<RecordingsWebView onBack={onBack} />);

    fireEvent.press(getByTestId('webview-trigger-error'));

    expect(getByText('Could not load recordings.')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
    expect(queryByTestId('webview-mock')).toBeNull();

    fireEvent.press(getByText('Retry'));

    expect(queryByText('Could not load recordings.')).toBeNull();
    expect(getByTestId('webview-mock')).toBeTruthy();
  });
});
