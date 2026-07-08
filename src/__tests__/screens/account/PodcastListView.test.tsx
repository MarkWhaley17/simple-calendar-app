import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import PodcastListView from '../../../screens/account/PodcastListView';
import { fetchPodcastEpisodes } from '../../../services/podcasts';

jest.mock('../../../services/podcasts', () => ({
  fetchPodcastEpisodes: jest.fn(),
}));

const mockedFetchPodcastEpisodes = fetchPodcastEpisodes as jest.Mock;

describe('PodcastListView', () => {
  const mockOnBack = jest.fn();
  const mockOnSelectEpisode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching', () => {
    mockedFetchPodcastEpisodes.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<PodcastListView onBack={mockOnBack} onSelectEpisode={mockOnSelectEpisode} />);
    expect(getByTestId('podcasts-loading')).toBeTruthy();
  });

  it('renders episodes once loaded, including hours-long durations', async () => {
    mockedFetchPodcastEpisodes.mockResolvedValueOnce([
      {
        id: 'ep-1',
        title: 'Turning obstacles into the path',
        description: 'A talk on working with setbacks.',
        audioUrl: 'https://example.com/ep1.mp3',
        durationSeconds: 8072,
        publishedAt: '2026-07-02T10:00:00.000Z',
      },
    ]);

    const { getByText, getByTestId } = render(<PodcastListView onBack={mockOnBack} onSelectEpisode={mockOnSelectEpisode} />);

    await waitFor(() => {
      expect(getByText('Turning obstacles into the path')).toBeTruthy();
    });
    expect(getByText('A talk on working with setbacks.')).toBeTruthy();
    expect(getByText(/2:14:32/)).toBeTruthy();
    expect(getByTestId('podcast-episode-ep-1')).toBeTruthy();
  });

  it('shows an empty state when there are no episodes', async () => {
    mockedFetchPodcastEpisodes.mockResolvedValueOnce([]);
    const { getByTestId } = render(<PodcastListView onBack={mockOnBack} onSelectEpisode={mockOnSelectEpisode} />);

    await waitFor(() => {
      expect(getByTestId('podcasts-empty')).toBeTruthy();
    });
  });

  it('shows an error state and retries on demand', async () => {
    mockedFetchPodcastEpisodes.mockRejectedValueOnce(new Error('Network down'));
    const { getByTestId, getByText } = render(<PodcastListView onBack={mockOnBack} onSelectEpisode={mockOnSelectEpisode} />);

    await waitFor(() => {
      expect(getByTestId('podcasts-error')).toBeTruthy();
    });
    expect(getByText('Network down')).toBeTruthy();

    mockedFetchPodcastEpisodes.mockResolvedValueOnce([]);
    fireEvent.press(getByTestId('podcasts-retry-button'));

    await waitFor(() => {
      expect(mockedFetchPodcastEpisodes).toHaveBeenCalledTimes(2);
      expect(getByTestId('podcasts-empty')).toBeTruthy();
    });
  });

  it('calls onSelectEpisode when an episode row is pressed', async () => {
    const episode = {
      id: 'ep-1',
      title: 'Turning obstacles into the path',
      audioUrl: 'https://example.com/ep1.mp3',
      durationSeconds: 8072,
      publishedAt: '2026-07-02T10:00:00.000Z',
    };
    mockedFetchPodcastEpisodes.mockResolvedValueOnce([episode]);

    const { getByTestId } = render(<PodcastListView onBack={mockOnBack} onSelectEpisode={mockOnSelectEpisode} />);

    await waitFor(() => {
      expect(getByTestId('podcast-episode-ep-1')).toBeTruthy();
    });
    fireEvent.press(getByTestId('podcast-episode-ep-1'));

    expect(mockOnSelectEpisode).toHaveBeenCalledWith(episode);
  });

  it('calls onBack when the back button is pressed', async () => {
    mockedFetchPodcastEpisodes.mockResolvedValueOnce([]);
    const { getByTestId } = render(<PodcastListView onBack={mockOnBack} onSelectEpisode={mockOnSelectEpisode} />);

    fireEvent.press(getByTestId('podcasts-header-back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
