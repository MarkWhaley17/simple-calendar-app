// Mock config before imports so events.ts picks up the mock
jest.mock('../../../src/config', () => ({
  __esModule: true,
  default: { excludedEventTitles: [] as string[] },
}));

import config from '../../../src/config';
import { getEvents } from '../../../src/utils/events';

describe('getEvents', () => {
  afterEach(() => {
    config.excludedEventTitles = [];
  });

  it('returns Jambhala Day and King of Ling Lhasang events when excludedEventTitles is empty', () => {
    config.excludedEventTitles = [];

    const events = getEvents();
    const titles = events.map(e => e.title);
    expect(titles).toContain('Jambhala Day');
    expect(titles).toContain('King of Ling Lhasang');
  });

  it('excludes Jambhala Day and King of Ling Lhasang when listed in excludedEventTitles', () => {
    config.excludedEventTitles = ['Jambhala Day', 'King of Ling Lhasang'];

    const events = getEvents();
    const titles = events.map(e => e.title);
    expect(titles).not.toContain('Jambhala Day');
    expect(titles).not.toContain('King of Ling Lhasang');
  });

  it('does not exclude other events when filtering', () => {
    config.excludedEventTitles = ['Jambhala Day', 'King of Ling Lhasang'];

    const events = getEvents();
    const titles = events.map(e => e.title);
    expect(titles).toContain('Medicine Buddha Day');
  });
});
