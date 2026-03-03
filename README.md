# hevy-api-client

TypeScript/JavaScript client for the [Hevy API](https://api.hevyapp.com), generated from the OpenAPI spec with [@hey-api/openapi-ts](https://heyapi.dev/openapi-ts/). Uses [Axios](https://heyapi.dev/openapi-ts/clients/axios) under the hood. Includes Zod schemas for request/response validation.

## Installation

```bash
npm install hevy-api-client
# or
pnpm add hevy-api-client
```

## Usage

### Configure API key

The Hevy API requires an `api-key` header. Configure it once before making requests:

```ts
import { configureClient, getV1Workouts } from "hevy-api-client";

configureClient({ apiKey: "YOUR_HEVY_API_KEY" });

const { data } = await getV1Workouts({});
```

### Per-request API key

Alternatively, pass the header per request:

```ts
await getV1Workouts({ headers: { "api-key": "YOUR_KEY" } });
```

### Custom client instance

Use `createClient` for isolated instances:

```ts
import { createClient, createConfig, getV1Workouts } from "hevy-api-client";

const client = createClient(
  createConfig({
    baseURL: "https://api.hevyapp.com",
    headers: { "api-key": "YOUR_KEY" },
  }),
);

await getV1Workouts({ client });
```

### Axios interceptors

The client exposes the underlying Axios instance for interceptors:

```ts
import { client } from "hevy-api-client";

client.instance.interceptors.request.use((config) => {
  // modify request
  return config;
});
```

## Development

### Getting started

The recommended setup is to install Oxlint and Oxfmt as dev dependencies and add scripts:

```bash
pnpm add -D oxlint oxfmt
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check",
    "typecheck": "tsgo --noEmit"
  }
}
```

### Commands

```bash
pnpm install
pnpm run fetch-spec   # Fetch and fix OpenAPI spec from Hevy
pnpm run generate     # Generate client with openapi-ts
pnpm run build        # Compile to dist/
pnpm run test         # Run tests
pnpm run lint         # Run Oxlint
pnpm run lint:fix     # Run Oxlint with auto-fix
pnpm run format       # Format with Oxfmt
pnpm run format:check # Check formatting without writing
pnpm run typecheck    # Type-check with tsgo (native, ~10x faster)
```

### Integration tests

Integration tests call the real Hevy API. Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
# Edit .env and set API_KEY=your_hevy_api_key
pnpm run test         # Integration tests run when API_KEY is set
pnpm run test:integration  # Run only integration tests
```

### Releases

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Push to `main` or `master` to trigger a release. Version and changelog are derived from [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` → minor release (0.1.0 → 0.2.0)
- `fix:` → patch release (0.1.0 → 0.1.1)
- `feat!:` or `BREAKING CHANGE:` → major release (0.1.0 → 1.0.0)

**Required secrets** (GitHub repo Settings → Secrets):

- `NPM_TOKEN` – npm access token for publishing (create at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens))

## License

MIT
