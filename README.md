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

Use `createClient` with `createHevyConfig` for isolated instances (baseURL defaults to `https://api.hevyapp.com`):

```ts
import { createClient, createHevyConfig, getV1Workouts } from "hevy-api-client";

const client = createClient(createHevyConfig({ apiKey: "YOUR_KEY" }));

await getV1Workouts({ client });
```

Or use `createConfig` with explicit baseURL:

```ts
import { createClient, createConfig, getV1Workouts } from "hevy-api-client";

const client = createClient(
  createConfig({
    baseURL: "https://api.hevyapp.com",
    headers: { "api-key": "YOUR_KEY" },
  }),
);
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

To run integration tests in CI, set the API key as a GitHub secret:

```bash
pnpm run secret:set    # Reads API_KEY from .env, sets via gh secret set API_KEY
```

### Releases

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Push to `main` or `master` to trigger a release. Version and changelog are derived from [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` → minor release (0.1.0 → 0.2.0)
- `fix:` → patch release (0.1.0 → 0.1.1)
- `feat!:` or `BREAKING CHANGE:` → major release (0.1.0 → 1.0.0)

**Required secrets** (GitHub repo Settings → Secrets):

- `API_KEY` – Hevy API key for integration tests in CI (optional; run `pnpm run secret:set` to set from `.env`)

**npm publishing** uses [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) (no token). Configure on [npmjs.com](https://www.npmjs.com/) → package → Settings → Trusted Publisher: add GitHub Actions, workflow `release.yml`, and your repo.

## License

MIT
