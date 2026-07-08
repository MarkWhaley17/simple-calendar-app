import { fetchPodcastEpisodes, parseRssFeed } from '../../services/podcasts';
import { apiFetch } from '../../services/api';
import config from '../../config';

jest.mock('../../services/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('../../config', () => ({
  __esModule: true,
  default: { podcastSource: { type: 'api', endpoint: '/api/v1/podcasts' } },
}));

const mockedApiFetch = apiFetch as jest.Mock;
const mockedConfig = config as unknown as { podcastSource: { type: string; endpoint?: string; feedUrl?: string } };

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Sample Podcast</title>
    <item>
      <title>Episode one</title>
      <description>The first episode.</description>
      <guid>episode-1</guid>
      <pubDate>Thu, 02 Jul 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.com/ep1.mp3" type="audio/mpeg" length="123" />
      <itunes:duration>1:15:32</itunes:duration>
      <itunes:image href="https://example.com/ep1.jpg" />
    </item>
    <item>
      <title>Episode two (no audio)</title>
      <description>Missing an enclosure, should be skipped.</description>
      <guid>episode-2</guid>
      <pubDate>Thu, 25 Jun 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Episode three</title>
      <guid>episode-3</guid>
      <pubDate>not a real date</pubDate>
      <enclosure url="https://example.com/ep3.mp3" type="audio/mpeg" length="456" />
      <itunes:duration>930</itunes:duration>
    </item>
  </channel>
</rss>`;

describe('fetchPodcastEpisodes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
  });

  it('fetches from the WordPress API endpoint when podcastSource is api', async () => {
    mockedConfig.podcastSource = { type: 'api', endpoint: '/api/v1/podcasts' };
    mockedApiFetch.mockResolvedValueOnce([{ id: '1' }]);

    const episodes = await fetchPodcastEpisodes();

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/v1/podcasts');
    expect(episodes).toEqual([{ id: '1' }]);
  });

  it('returns an empty list when podcastSource is rss with no feed URL configured yet', async () => {
    mockedConfig.podcastSource = { type: 'rss', feedUrl: '' };

    const episodes = await fetchPodcastEpisodes();

    expect(episodes).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches and parses episodes from an RSS feed', async () => {
    mockedConfig.podcastSource = { type: 'rss', feedUrl: 'https://example.com/feed.xml' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(SAMPLE_RSS),
    });

    const episodes = await fetchPodcastEpisodes();

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/feed.xml');
    expect(mockedApiFetch).not.toHaveBeenCalled();
    expect(episodes).toHaveLength(2);
  });

  it('throws when the RSS feed request fails', async () => {
    mockedConfig.podcastSource = { type: 'rss', feedUrl: 'https://example.com/feed.xml' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(fetchPodcastEpisodes()).rejects.toThrow('503');
  });
});

describe('parseRssFeed', () => {
  it('skips items with no enclosure (no playable audio)', () => {
    const episodes = parseRssFeed(SAMPLE_RSS);
    expect(episodes.map((e) => e.id)).toEqual(['episode-1', 'episode-3']);
  });

  it('parses an HH:MM:SS itunes:duration into seconds', () => {
    const episodes = parseRssFeed(SAMPLE_RSS);
    const episodeOne = episodes.find((e) => e.id === 'episode-1')!;
    expect(episodeOne.durationSeconds).toBe(1 * 3600 + 15 * 60 + 32);
    expect(episodeOne.audioUrl).toBe('https://example.com/ep1.mp3');
    expect(episodeOne.artworkUrl).toBe('https://example.com/ep1.jpg');
    expect(episodeOne.title).toBe('Episode one');
  });

  it('parses a plain-seconds itunes:duration', () => {
    const episodes = parseRssFeed(SAMPLE_RSS);
    const episodeThree = episodes.find((e) => e.id === 'episode-3')!;
    expect(episodeThree.durationSeconds).toBe(930);
  });

  it('strips HTML show-notes markup from the description', () => {
    const xmlWithHtmlDescription = `<?xml version="1.0"?>
<rss version="2.0"><channel><item>
  <title>Show notes episode</title>
  <guid>episode-html</guid>
  <description><![CDATA[<p>Intro text.<br />More info: <a href="https://example.com">link</a></p>]]></description>
  <enclosure url="https://example.com/ep-html.mp3" type="audio/mpeg" length="1" />
</item></channel></rss>`;

    const [episode] = parseRssFeed(xmlWithHtmlDescription);
    expect(episode.description).toBe('Intro text. More info: link');
  });

  it('falls back to the epoch when pubDate is unparseable', () => {
    const episodes = parseRssFeed(SAMPLE_RSS);
    const episodeThree = episodes.find((e) => e.id === 'episode-3')!;
    expect(episodeThree.publishedAt).toBe(new Date(0).toISOString());
  });
});
