---
name: hevy-api clean repo Hey API
overview: "Plan to create a new hevy-api repository from scratch using @hey-api/openapi-ts to generate the API client from the Hevy OpenAPI spec (loaded the same way as today: fetch from Hevy, apply fixes, then generate), with optional resolvers for spec quirks, and publish only the client package to npm."
todos: []
isProject: false
---

# hevy-api: Clean repo with Hey API (openapi-ts)

Create a **new repository** named **hevy-api** that contains only the Hevy API client, generated with [@hey-api/openapi-ts](https://heyapi.dev/openapi-ts/), and publish it to npm. The OpenAPI spec is loaded from Hevy in the same way as the current hevy-mcp setup (fetch from Hevy’s docs, apply fixes, then generate from the fixed spec).

---

## 1. Repository and package setup

- **Repository**: New Git repo `hevy-api` (e.g. `chrisdoc/hevy-api`).
- **Package name**: `hevy-api` (or a scoped name like `@your-scope/hevy-api`). Use this in `package.json` so consumers can `npm install hevy-api`.
- **Runtime**: Node.js 20+; use pnpm and an `.nvmrc` if desired.
- **Build**: Publish a built artifact (e.g. `dist/` with ESM and `.d.ts`). Set `package.json`: `main`, `module`, `types`, and `exports` to the built entry (e.g. `dist/index.js` / `dist/index.d.ts`). Use `files: ["dist"]` (or include only what you want to publish) so only the client is published.

---

## 2. Loading the OpenAPI spec from Hevy (same approach as today)

The spec is **not** taken from a remote URL directly by openapi-ts. It is **fetched and fixed first**, then openapi-ts reads the **local fixed file**.

- **Fetch script**: Port or reuse the existing logic from hevy-mcp’s [scripts/openapi-spec.js](scripts/openapi-spec.js):
  - **Source**: `GET https://api.hevyapp .com/docs/swagger-ui-init.js`.
  - **Extract**: Parse the JS (e.g. with `abstract-syntax-tree` or equivalent), find the `options.swaggerDoc` object, and serialize it to JSON.
  - **Fix**: Apply the same fixes as today (invalid `required` on properties, invalid enum `type`, `$ref` siblings, missing parameter schemas, invalid examples, missing `servers`, missing global tags, generated `operationId`s). See the existing `fixOpenAPISpec()` and helpers in that script.
  - **Write**: Save the result to a file in the repo root, e.g. `openapi-spec.json`.
- **Script command**: Expose a script (e.g. `pnpm run fetch-spec` or `pnpm run openapi`) that runs this script so that `openapi-spec.json` is up to date before generation.
- **openapi-ts input**: Point Hey API at this **local file** (e.g. `./openapi-spec.json`). Do **not** point openapi-ts at the Hevy URL directly; the fixes are required for a valid, usable spec.

This keeps “load the OpenAPI spec from Hevy like we do at the moment” while using openapi-ts only on the fixed spec.

---

## 3. Configure @hey-api/openapi-ts

- **Install**: Add `@hey-api/openapi-ts` as a dev dependency (pin exact version if desired; [docs](https://heyapi.dev/openapi-ts/) recommend pinning).
- **Config file**: Add `openapi-ts.config.ts` (or `.mjs`/`.cjs`) in the repo root using [defineConfig](https://heyapi.dev/openapi-ts/configuration):
  - **input**: Path to the fixed spec, e.g. `./openapi-spec.json` (or `./openapi-spec.yaml` if you convert). Ensure the fetch script has been run at least once so the file exists.
  - **output**: Directory for generated code, e.g. `src/client` or `src/generated`. Treat this directory as generated; do not hand-edit.
- **Plugins**: Enable the plugins you need:
  - **TypeScript**: Types/interfaces from the spec (often on by default).
  - **Client**: Choose one HTTP client plugin (e.g. **Axios** or **Fetch**) so the generated SDK can be used with `axios` or `fetch`. [Plugins list](https://heyapi.dev/openapi-ts/) includes Axios, Fetch API, etc.
  - **Zod** (optional but useful): Generate Zod schemas for request/response validation. Aligns with hevy-mcp’s current use of Zod.
- **Resolvers** (optional): If the fixed spec still produces invalid or undesirable output (e.g. strict enums, date formats), use [Resolvers](https://heyapi.dev/openapi-ts/plugins/concepts/resolvers) to patch the Zod (or Valibot) plugin without forking. Resolvers are exposed via the `~resolvers` option on the plugin config. Example use cases from the docs: permissive enums (`z.union([z.enum([...]), z.string()])`), custom string formats, or replacing the default base schema. Add resolvers only as needed after a first generation pass.
- **Script**: Add a script (e.g. `pnpm run generate` or `pnpm run openapi-ts`) that runs the openapi-ts CLI so that `openapi-ts` uses the config file (e.g. `openapi-ts` with no args if the config is discovered automatically, or pass the config path if required).

---

## 4. Package entry and exports

- **Entry**: The published package should expose a single entry that re-exports the generated client and types (and optionally Zod schemas). Options:
  - **Option A**: Create a small `src/index.ts` that imports from the generated output (e.g. `./client` or `./generated`) and re-exports the SDK factory, types, and schemas. Build this file (and its dependencies) into `dist/`.
  - **Option B**: If openapi-ts can generate an entry that is already usable as the package main, configure the build so that the generated entry becomes the package entry. Document the exact export shape (e.g. “call `createClient(baseUrl?, options?)` and use the returned SDK”).
- **API key**: Hevy API uses an `api-key` header. The generated client may accept a config object or interceptors; ensure the published usage docs or types show how to set the `api-key` header (e.g. via client options or axios/fetch interceptors). No need to implement a separate “createClient” wrapper unless the generator does not expose a convenient factory.
- **Exports**: In `package.json` `exports`, expose the main entry and optionally subpaths (e.g. `"./types"`) if you want consumers to import types only. Ensure TypeScript types are included (e.g. `types` condition or separate `types` field).

---

## 5. Build and publish pipeline

- **Pre-generate**: Before building, run the spec fetch script then openapi-ts (e.g. `pnpm run fetch-spec && pnpm run generate`). This can be a single script (e.g. `pnpm run prepare-client`) or part of `prebuild`.
- **Build**: Compile the package (e.g. `tsc` or a bundler) so that `dist/` contains the generated client plus any hand-written entry. Do not publish the raw generated source unless you intend to; publishing `dist` is enough.
- **Ignore**: Add `openapi-spec.json` to `.gitignore` **only if** you prefer to always fetch it in CI/local (otherwise commit it for reproducibility). Ignore build artifacts and node_modules.
- **Publish**: Use `npm publish` (or your registry). Bump version (e.g. with `npm version` or a CI step). Decide public vs restricted and whether to use a scope.

---

## 6. Scope: only the API client, no MCP

- This plan **does not** include the MCP server, any hevy-mcp refactors, or consumer updates. The deliverable is a **single npm package** that provides the Hevy API client and types (and optionally Zod schemas), loadable from a clean repo that:
  1. Fetches the OpenAPI spec from Hevy (same way as today),
  2. Fixes it and writes a local spec file,
  3. Runs @hey-api/openapi-ts to generate the client (and optionally resolvers for quirks),
  4. Builds and publishes the package to npm.

---

## 7. Order of operations (execution checklist)

1. Create new repo and initialize (git, pnpm, package.json, .nvmrc).
2. Add the Hevy spec fetch script (port from hevy-mcp); add `fetch-spec` (or `openapi`) script and run it once to produce `openapi-spec.json`.
3. Install @hey-api/openapi-ts and add `openapi-ts.config.ts` with `input: './openapi-spec.json'`, `output: 'src/client'` (or chosen path), and plugins (TypeScript, Axios or Fetch, Zod). Run generation.
4. If generation fails or produces bad Zod/enum behavior, add `~resolvers` to the Zod plugin per [Resolvers](https://heyapi.dev/openapi-ts/plugins/concepts/resolvers).
5. Add a minimal `src/index.ts` (or use generated entry) that re-exports client and types; configure build to output to `dist/`.
6. Set `package.json` `main`, `module`, `types`, `exports`, and `files`; add build script.
7. Run build, then `npm publish` (or equivalent).

---

## 8. References

- Hey API openapi-ts: [Get started](https://heyapi.dev/openapi-ts/), [Configuration](https://heyapi.dev/openapi-ts/configuration).
- Resolvers (customize Zod/Valibot plugins): [Resolvers](https://heyapi.dev/openapi-ts/plugins/concepts/resolvers).
- Current spec loading and fixes: [scripts/openapi-spec.js](scripts/openapi-spec.js) in hevy-mcp.
