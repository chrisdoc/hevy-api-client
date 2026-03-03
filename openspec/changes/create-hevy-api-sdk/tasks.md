# Tasks: Create Hevy API SDK

Implementation steps. Mark complete with `- [x]` when done.

## Repo and package setup

- [x] Create new repo and initialize (git, pnpm, package.json, .nvmrc for Node 20+).
- [x] Set package name to `hevy-api` (or scoped) in package.json.
- [x] Configure build to output ESM + .d.ts to `dist/`; set `main`, `module`, `types`, `exports`, and `files: ["dist"]` in package.json.

## OpenAPI spec fetch and fix

- [x] Port or reuse spec fetch logic from scripts/openapi-spec.js (GET https://api.hevyapp.com/docs/swagger-ui-init.js, extract swaggerDoc, apply fixOpenAPISpec and helpers).
- [x] Add script command (e.g. `pnpm run fetch-spec` or `pnpm run openapi`) and run once to produce openapi-spec.json.
- [x] Decide whether to commit openapi-spec.json or add to .gitignore and fetch in CI; update .gitignore accordingly.

## Generate client with @hey-api/openapi-ts

- [x] Install @hey-api/openapi-ts as dev dependency (pin version).
- [x] Add openapi-ts.config.ts with input ./openapi-spec.json, output (e.g. src/client or src/generated), and plugins (TypeScript, Axios or Fetch, Zod). Zod is required for validation.
- [x] Add script (e.g. `pnpm run generate`) to run openapi-ts CLI.
- [x] Run generation; if Zod/enum output is wrong, add ~resolvers to the Zod plugin per docs and re-run.

## Package entry and exports

- [x] Add minimal src/index.ts that re-exports generated client, types, and Zod schemas (or use generated entry and document export shape).
- [x] Document or type how to set the api-key header (client options or interceptors).
- [x] Ensure package.json exports expose main entry and optionally subpaths (e.g. "./types") with types.

## Testing

- [x] Add test suite (Vitest, Jest, or equivalent); add `pnpm run test` script.
- [x] Add tests for: spec fetch produces valid JSON, client generation runs, client can be instantiated with api-key, key types/endpoints are importable.
- [x] Ensure all tests pass.

## Build and publish

- [x] Add pre-generate step (e.g. prepare-client: fetch-spec && generate) and wire into build or document in README.
- [x] Add build script; verify dist/ contains client and types.
- [x] Run tests, then build, then validate package (e.g. npm pack); then npm publish (or equivalent) when ready.
