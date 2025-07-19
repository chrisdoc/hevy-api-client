export { createClient, type ClientOptions } from './generated/client';
export * from './generated/sdk.gen';
export * from './generated/types.gen';

import { createClient as createHevyClient, type ClientOptions as HevyClientOptions } from './generated/client';

export class HevyAPIClient {
    public client: ReturnType<typeof createHevyClient>;

    constructor(apiKey: string, options: HevyClientOptions & { headers?: Record<string, string> } = {}) {
        const { headers: additionalHeaders, ...restOptions } = options;
        this.client = createHevyClient({
            baseUrl: 'https://api.hevyapp.com',
            ...restOptions,
            headers: {
                ...additionalHeaders,
                'api-key': apiKey,
            },
        });
    }
}
