# Design: Create Hevy API SDK

## 1. Repository and package

- **Repo**: New Git repo `hevy-api` (e.g. `chrisdoc/hevy-api`).
- **Package name**: `hevy-api` or scoped (e.g. `@your-scope/hevy-api`). Reflected in `package.json` for `npm install hevy-api`.
- **Runtime**: Node.js 20+; pnpm; optional `.nvmrc`.
- **Publish surface**: Built artifact only. `package.json`: `main`, `module`, `types`, `exports` point at built entry (e.g. `dist/index.js` / `dist/index.d.ts`). `files: ["dist"]` so only the client is published.

## 2. OpenAPI spec: fetch and fix (then generate)

The spec is **not** passed to openapi-ts as a URL. It is **fetched and fixed first**; openapi-ts reads a **local fixed file**.

- **Fetch script** (port from existing [scripts/openapi-spec.js](scripts/openapi-spec.js)):
  - **Source**: `GET https://api.hevyapp.com/docs/swagger-ui-init.js`.
  - **Extract**: Parse the JS (e.g. `abstract-syntax-tree`), find `options.swaggerDoc`, serialize to JSON.
  - **Fix**: Reuse existing fixes: invalid `required` on properties, invalid enum `type`, `$ref` siblings, missing parameter schemas, invalid examples, missing `servers`, missing global tags, generated `operationId`s (`fixOpenAPISpec()` and helpers).
  - **Write**: Save to repo root, e.g. `openapi-spec.json`.
- **Script**: Expose `pnpm run fetch-spec` (or `pnpm run openapi`) so `openapi-spec.json` can be refreshed before generation.
- **openapi-ts input**: Config points at **local file** only (e.g. `./openapi-spec.json`). Do not point at the Hevy URL; fixes are required for a valid spec.

## 3. @hey-api/openapi-ts configuration

- **Install**: `@hey-api/openapi-ts` as dev dependency (pin version as recommended).
- **Config**: `openapi-ts.config.ts` (or `.mjs`/`.cjs`) in repo root with [defineConfig](https://heyapi.dev/openapi-ts/configuration):
  - **input**: `./openapi-spec.json` (run fetch script at least once first).
  - **output**: e.g. `src/client` or `src/generated`; treat as generated, do not hand-edit.
- **Plugins**:
  - TypeScript (types/interfaces).
  - One HTTP client plugin: **Axios** or **Fetch**.
  - **Zod**: request/response validation schemas (required).
- **Resolvers** (optional): If the fixed spec still yields bad Zod/enums (e.g. strict enums, date formats), use [Resolvers](https://heyapi.dev/openapi-ts/plugins/concepts/resolvers) via `~resolvers` on the plugin config (e.g. permissive enums, custom string formats). Add only after a first generation pass if needed.
- **Script**: e.g. `pnpm run generate` or `pnpm run openapi-ts` to run the openapi-ts CLI (config discovered automatically or passed explicitly).

## 4. Package entry and exports

- **Entry**: Single entry re-exporting generated client, types, and Zod schemas.
  - **Option A**: Small `src/index.ts` that imports from generated output and re-exports SDK factory, types, schemas; build into `dist/`.
  - **Option B**: If the generator can emit a suitable package entry, use that and document the export shape (e.g. `createClient(baseUrl?, options?)` and returned SDK).
- **API key**: Hevy uses an `api-key` header. Rely on generator config or interceptors; document in README/types how to set `api-key` (client options or axios/fetch interceptors). Add a thin wrapper only if the generator does not expose a convenient factory.
- **Exports**: In `package.json` `exports`, expose main entry and optionally subpaths (e.g. `"./types"`). Include TypeScript types (`types` condition or `types` field).

## 5. Testing

- **Test suite**: Add unit and/or integration tests (e.g. Vitest, Jest). Test at least: spec fetch script produces valid JSON, client generation runs, generated client can be instantiated with api-key, key endpoints or types are importable.
- **Script**: `pnpm run test` (or equivalent). Tests SHALL pass before publish.

## 6. Build and publish pipeline

- **Pre-generate**: Before build, run fetch then generate (e.g. `pnpm run fetch-spec && pnpm run generate`). Can be a single script (e.g. `prepare-client`) or part of `prebuild`; prefer a dedicated script to avoid running fetch on every install.
- **Build**: Compile to `dist/` (e.g. `tsc` or bundler). Publish only `dist/`, not raw generated source.
- **Ignore**: `.gitignore` for build artifacts and `node_modules`. Optionally ignore `openapi-spec.json` if you always fetch in CI; otherwise commit it for reproducibility.
- **Publish**: `npm publish`; version via `npm version` or CI. Decide public vs restricted and scope.

## 7. References

- [Hey API openapi-ts – Get started & Configuration](https://heyapi.dev/openapi-ts/configuration)
- [Resolvers (Zod/Valibot)](https://heyapi.dev/openapi-ts/plugins/concepts/resolvers)
- Current spec loading/fixes: [scripts/openapi-spec.js](scripts/openapi-spec.js)
