import { ClientConfig } from './types';
import kalapa from './clients/kalapa';

/**
 * Client registry — add new clients here as they are onboarded.
 * The EXPO_PUBLIC_APP_CLIENT env var selects which config is active.
 * Defaults to 'kalapa' if the var is unset (local dev).
 */
const clients: Record<string, ClientConfig> = {
  kalapa,
};

const clientId = process.env.EXPO_PUBLIC_APP_CLIENT ?? 'kalapa';

const config = clients[clientId];

if (!config) {
  throw new Error(
    `Unknown APP_CLIENT "${clientId}". Add it to src/config/clients/ and register it in src/config/index.ts`
  );
}

export default config;
export type { ClientConfig };
