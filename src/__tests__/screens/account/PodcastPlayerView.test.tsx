import React from 'react';
import { fireEvent, render, waitFor, act } from '@testing-library/react-native';
import PodcastPlayerView from '../../../screens/account/PodcastPlayerView';
import { Audio } from 'expo-av';
import { PodcastEpisode } from '../../../services/podcasts';

let capturedOnStatusUpdate: ((status: any) => void) | undefined;
let mockSound: {
  playAsync: jest.Mock;
  pauseAsync: jest.Mock;
  setPositionAsync: jest.Mock;
  unloadAsync: jest.Mock;
};

jest.mock('expo-av', () => ({
  InterruptionModeIOS: { DoNotMix: 'DoNotMix' },
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

const mockedCreateAsync = Audio.Sound.createAsync as jest.Mock;

const episode: PodcastEpisode = {
  id: 'ep-1',
  title: 'Turning obstacles into the path',
  audioUrl: 'https://example.com/ep1.mp3',
  durationSeconds: 8072,
  publishedAt: '2026-07-02T10:00:00.000Z',
};

describe('PodcastPlayerView', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSound = {
      playAsync: jest.fn(() => Promise.resolve()),
      pauseAsync: jest.fn(() => Promise.resolve()),
      setPositionAsync: jest.fn(() => Promise.resolve()),
      unloadAsync: jest.fn(() => Promise.resolve()),
    };
    mockedCreateAsync.mockImplementation((_source: unknown, _initialStatus: unknown, onStatusUpdate: any) => {
      capturedOnStatusUpdate = onStatusUpdate;
      return Promise.resolve({ sound: mockSound });
    });
  });

  it('shows a loading state while the audio loads', () => {
    mockedCreateAsync.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<PodcastPlayerView episode={episode} onBack={mockOnBack} />);
    expect(getByTestId('podcast-player-loading')).toBeTruthy();
  });

  it('shows playback controls once loaded and reflects status updates', async () => {
    const { getByTestId, getByText } = render(<PodcastPlayerView episode={episode} onBack={mockOnBack} />);

    await waitFor(() => expect(getByTestId('podcast-player-play-pause')).toBeTruthy());

    act(() => {
      capturedOnStatusUpdate?.({
        isLoaded: true,
        isPlaying: true,
        positionMillis: 65000,
        durationMillis: 8072000,
      });
    });

    expect(getByTestId('podcast-player-play-pause').props.accessibilityLabel).toBe('Pause');
    expect(getByText('1:05')).toBeTruthy();
  });

  it('toggles play/pause on the sound object', async () => {
    const { getByTestId } = render(<PodcastPlayerView episode={episode} onBack={mockOnBack} />);
    await waitFor(() => expect(getByTestId('podcast-player-play-pause')).toBeTruthy());

    act(() => {
      capturedOnStatusUpdate?.({ isLoaded: true, isPlaying: true, positionMillis: 0, durationMillis: 8072000 });
    });

    fireEvent.press(getByTestId('podcast-player-play-pause'));
    await waitFor(() => expect(mockSound.pauseAsync).toHaveBeenCalledTimes(1));
  });

  it('shows an error state when the audio fails to load', async () => {
    mockedCreateAsync.mockRejectedValueOnce(new Error('Could not stream this file'));
    const { getByTestId, getByText } = render(<PodcastPlayerView episode={episode} onBack={mockOnBack} />);

    await waitFor(() => expect(getByTestId('podcast-player-error')).toBeTruthy());
    expect(getByText('Could not stream this file')).toBeTruthy();
  });

  it('calls onBack when the back button is pressed', async () => {
    const { getByTestId } = render(<PodcastPlayerView episode={episode} onBack={mockOnBack} />);
    fireEvent.press(getByTestId('podcast-player-back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('unloads the sound on unmount', async () => {
    const { getByTestId, unmount } = render(<PodcastPlayerView episode={episode} onBack={mockOnBack} />);
    await waitFor(() => expect(getByTestId('podcast-player-play-pause')).toBeTruthy());

    unmount();
    expect(mockSound.unloadAsync).toHaveBeenCalledTimes(1);
  });
});
