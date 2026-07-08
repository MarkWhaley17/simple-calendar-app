import kalapa from '../../config/clients/kalapa';
import vajrayana from '../../config/clients/vajrayana';

describe('podcast feature config', () => {
  it('kalapa fetches episodes from its WordPress API endpoint', () => {
    expect(kalapa.features.podcasts).toBe(true);
    expect(kalapa.podcastSource).toEqual({
      type: 'api',
      endpoint: '/api/v1/podcasts',
    });
  });

  it('vajrayana fetches episodes from an RSS feed since it has no backend', () => {
    expect(vajrayana.wpBaseUrl).toBe('');
    expect(vajrayana.features.podcasts).toBe(true);
    expect(vajrayana.podcastSource.type).toBe('rss');
  });

  it.each([kalapa, vajrayana])('$clientId declares a podcastSource matching its podcasts flag', (clientConfig) => {
    if (clientConfig.features.podcasts) {
      expect(clientConfig.podcastSource).toBeDefined();
    }
  });
});
