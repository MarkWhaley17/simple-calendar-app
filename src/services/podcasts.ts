/**
 * Podcast episode service.
 * Fetches episode metadata from this client's configured podcastSource —
 * either a WordPress REST endpoint or a standard podcast RSS feed.
 */
import { XMLParser } from 'fast-xml-parser';
import { apiFetch } from './api';
import config from '../config';

export interface PodcastEpisode {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  artworkUrl?: string;
  durationSeconds?: number;
  publishedAt: string; // ISO 8601
}

export async function fetchPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const source = config.podcastSource;

  if (source.type === 'api') {
    return apiFetch<PodcastEpisode[]>(source.endpoint);
  }

  return fetchFromRssFeed(source.feedUrl);
}

async function fetchFromRssFeed(feedUrl: string): Promise<PodcastEpisode[]> {
  if (!feedUrl) {
    return [];
  }

  // RSS feeds are external, unauthenticated URLs unrelated to this client's own
  // WordPress backend, so this calls fetch() directly rather than apiFetch() —
  // apiFetch() would prepend wpBaseUrl and attach this client's auth token to a
  // third-party host, which is both wrong and a token-leak risk.
  const res = await fetch(feedUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch podcast feed: HTTP ${res.status}`);
  }

  const xml = await res.text();
  return parseRssFeed(xml);
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)['#text']);
  }
  return '';
}

/** Strips HTML tags from show-notes descriptions (real-world feeds often embed <p>/<a> markup) and collapses whitespace. */
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Parses an itunes:duration value, which may be plain seconds ("930") or "HH:MM:SS" / "MM:SS". */
function parseItunesDuration(value: unknown): number | undefined {
  const raw = textOf(value).trim();
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return Number(raw);

  const parts = raw.split(':').map(Number);
  if (parts.length === 0 || parts.some(Number.isNaN)) return undefined;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function parsePublishedAt(value: unknown): string {
  const raw = textOf(value);
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : new Date(0).toISOString();
}

export function parseRssFeed(xml: string): PodcastEpisode[] {
  const parsed = xmlParser.parse(xml);
  const items = toArray(parsed?.rss?.channel?.item);

  return items
    .map((item: Record<string, unknown>): PodcastEpisode | null => {
      const enclosure = item.enclosure as Record<string, unknown> | undefined;
      const audioUrl = enclosure?.['@_url'] as string | undefined;
      if (!audioUrl) return null;

      const itunesImage = item.image as Record<string, unknown> | undefined;

      return {
        id: textOf(item.guid) || audioUrl,
        title: textOf(item.title),
        description: stripHtml(textOf(item.description)) || undefined,
        audioUrl,
        artworkUrl: (itunesImage?.['@_href'] as string | undefined) || undefined,
        durationSeconds: parseItunesDuration(item.duration),
        publishedAt: parsePublishedAt(item.pubDate),
      };
    })
    .filter((episode): episode is PodcastEpisode => episode !== null);
}
