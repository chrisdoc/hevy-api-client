/**
 * Hevy API client - TypeScript/JavaScript SDK for the Hevy API.
 *
 * @example
 * ```ts
 * import { configureClient, getV1Workouts } from 'hevy-api-client';
 *
 * // Set your Hevy API key (required for all requests)
 * configureClient({ apiKey: 'YOUR_HEVY_API_KEY' });
 *
 * // Use the SDK
 * const { data } = await getV1Workouts({});
 * ```
 *
 * Alternatively, pass the api-key per request via headers:
 * ```ts
 * await getV1Workouts({ headers: { 'api-key': 'YOUR_KEY' } });
 * ```
 */

export { client, type CreateClientConfig } from "./client/client.gen.js";
export { createClient, createConfig } from "./client/client/index.js";

/** Default Hevy API base URL. */
export const HEVY_API_BASE_URL = "https://api.hevyapp.com";

export * from "./client/sdk.gen.js";
export * from "./client/types.gen.js";
export * from "./client/zod.gen.js";

import { client } from "./client/client.gen.js";
import { createConfig } from "./client/client/index.js";

/**
 * Configuration options for the Hevy API client.
 */
export interface HevyClientConfig {
  /** Your Hevy API key. Required for authenticated requests. */
  apiKey: string;
  /** Optional base URL (default: https://api.hevyapp.com) */
  baseUrl?: string;
}

/**
 * Configure the default Hevy API client with your API key.
 * Call this once before making any API requests.
 *
 * @param config - Configuration with apiKey (required) and optional baseUrl
 */
export function configureClient(config: HevyClientConfig): void {
  client.setConfig({
    baseURL: config.baseUrl ?? HEVY_API_BASE_URL,
    headers: {
      "api-key": config.apiKey,
    },
  });
}

/**
 * Create a config for a custom Hevy API client with default baseURL.
 * Use with createClient for isolated instances.
 *
 * @example
 * ```ts
 * const client = createClient(
 *   createHevyConfig({ apiKey: "YOUR_KEY" })
 * );
 * ```
 */
export function createHevyConfig(config: {
  apiKey: string;
  baseUrl?: string;
}): ReturnType<typeof createConfig> {
  return createConfig({
    baseURL: config.baseUrl ?? HEVY_API_BASE_URL,
    headers: { "api-key": config.apiKey },
  });
}
