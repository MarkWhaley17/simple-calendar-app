import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import RecordingsWebView from '../../../screens/account/RecordingsWebView';

const mockWebViewMethodMocks = {
  goBack: jest.fn(),
  goForward: jest.fn(),
  reload: jest.fn(),
};

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');

  return {
    WebView: React.forwardRef(({ source, onError, onLoadEnd, onNavigationStateChange }: any, ref: any) => {
      React.useImperativeHandle(ref, () => mockWebViewMethodMocks);
      return (
        <View testID="webview-mock">
          <Text testID="webview-source">{source?.uri ?? ''}</Text>
          <TouchableOpacity testID="webview-trigger-error" onPress={() => onError?.({})}>
            <Text>Trigger error</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="webview-trigger-load-end" onPress={() => onLoadEnd?.({})}>
            <Text>Trigger load end</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="webview-nav-login"
            onPress={() =>
              onNavigationStateChange?.({
                canGoBack: false,
                canGoForward: false,
                url: source?.uri ?? '',
              })
            }
          >
            <Text>Nav login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="webview-nav-recordings"
            onPress={() =>
              onNavigationStateChange?.({
                canGoBack: true,
                canGoForward: true,
                url: 'https://kalapamedia.com/my-recordings/',
              })
            }
          >
            <Text>Nav recordings</Text>
          </TouchableOpacity>
        </View>
      );
    }),
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

  it('renders upgraded shell elements', () => {
    const { getByTestId, getByText } = render(<RecordingsWebView onBack={onBack} />);

    expect(getByTestId('webview-background-pattern')).toBeTruthy();
    expect(getByTestId('webview-loading-overlay')).toBeTruthy();
    expect(getByText('Loading My Recordings')).toBeTruthy();
    expect(getByTestId('recordings-login-hint')).toBeTruthy();
  });

  it('calls onBack when back is pressed', () => {
    const { getByTestId } = render(<RecordingsWebView onBack={onBack} />);
    fireEvent.press(getByTestId('recordings-header-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('opens recordings page in external browser from header', async () => {
    const { getByTestId } = render(<RecordingsWebView onBack={onBack} />);
    fireEvent.press(getByTestId('recordings-header-browser'));

    await waitFor(() => {
      expect(openUrlSpy).toHaveBeenCalledWith('https://kalapamedia.com/my-recordings/');
    });
  });

  it('opens recordings page in external browser from error state', async () => {
    const { getByTestId, getByText } = render(<RecordingsWebView onBack={onBack} />);
    fireEvent.press(getByTestId('webview-trigger-error'));
    fireEvent.press(getByText('Open in Browser'));

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

  it('enables and disables in-webview nav controls based on navigation state', () => {
    const { getByTestId, queryByTestId } = render(<RecordingsWebView onBack={onBack} />);

    expect(getByTestId('webview-control-back').props.accessibilityState.disabled).toBe(true);
    expect(getByTestId('webview-control-forward').props.accessibilityState.disabled).toBe(true);
    expect(getByTestId('recordings-login-hint')).toBeTruthy();

    fireEvent.press(getByTestId('webview-nav-recordings'));

    expect(getByTestId('webview-control-back').props.accessibilityState.disabled).toBe(false);
    expect(getByTestId('webview-control-forward').props.accessibilityState.disabled).toBe(false);
    expect(queryByTestId('recordings-login-hint')).toBeNull();
  });

  it('hooks controls to webview actions', () => {
    const { getByTestId } = render(<RecordingsWebView onBack={onBack} />);
    fireEvent.press(getByTestId('webview-nav-recordings'));

    fireEvent.press(getByTestId('webview-control-back'));
    fireEvent.press(getByTestId('webview-control-forward'));
    fireEvent.press(getByTestId('webview-control-refresh'));

    expect(mockWebViewMethodMocks.goBack).toHaveBeenCalledTimes(1);
    expect(mockWebViewMethodMocks.goForward).toHaveBeenCalledTimes(1);
    expect(mockWebViewMethodMocks.reload).toHaveBeenCalledTimes(1);
  });
});
