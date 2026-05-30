import * as configModule from '../../../src/config';
import { getEvents } from '../../../src/utils/events';

describe('getEvents', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns Jambhala Day and King of Ling Lhasang events when excludedEventTitles is empty', () => {
    jest.replaceProperty(configModule, 'default', {
      ...configModule.default,
      excludedEventTitles: [],
    });

    const events = getEvents();
    const titles = events.map(e => e.title);
    expect(titles).toContain('Jambhala Day');
    expect(titles).toContain('King of Ling Lhasang');
  });

  it('excludes Jambhala Day and King of Ling Lhasang when listed in excludedEventTitles', () => {
    jest.replaceProperty(configModule, 'default', {
      ...configModule.default,
      excludedEventTitles: ['Jambhala Day', 'King of Ling Lhasang'],
    });

    const events = getEvents();
    const titles = events.map(e => e.title);
    expect(titles).not.toContain('Jambhala Day');
    expect(titles).not.toContain('King of Ling Lhasang');
  });

  it('does not exclude other events when filtering', () => {
    jest.replaceProperty(configModule, 'default', {
      ...configModule.default,
      excludedEventTitles: ['Jambhala Day', 'King of Ling Lhasang'],
    });

    const events = getEvents();
    const titles = events.map(e => e.title);
    expect(titles).toContain('Medicine Buddha Day');
  });
});
