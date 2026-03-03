# Proposal: Create Hevy API SDK

## What

Create a new **hevy-api** repository that ships a single npm package: a TypeScript/JavaScript client for the [Hevy API](https://api.hevyapp.com), generated from the Hevy OpenAPI spec using [@hey-api/openapi-ts](https://heyapi.dev/openapi-ts/). The package will be publishable to npm and consumable via `npm install hevy-api`.

## Why

- **Reusable client**: Today the Hevy API is used via custom code (e.g. in hevy-mcp). A dedicated SDK package allows any project to use the same typed client without duplicating spec handling or generation.
- **Single source of truth**: The client is generated from the same OpenAPI flow already used (fetch from Hevy → fix spec → generate). No change to how the spec is obtained or fixed.
- **Publishable**: One clean repo, one package, one publish step. No MCP or app code in this repo—only the API client, types, and Zod schemas for validation.

## Scope

- **In scope**: New repo setup, spec fetch/fix script (ported from current setup), @hey-api/openapi-ts config, generated client + types + Zod schemas for validation, build to `dist/`, tests, `package.json` exports, and npm publish.
- **Out of scope**: MCP server, hevy-mcp refactors, consumer app updates, or any code that is not the API client package.

## Non-goals

- Supporting multiple HTTP clients in one package (pick one: e.g. Axios or Fetch).
- Hand-maintaining the client (it is generated; only config and entry re-exports are hand-written).
- Bundling or documenting the OpenAPI spec in the package (optional; the important artifact is the built client in `dist/`).

## Success criteria

1. `pnpm run fetch-spec` (or equivalent) produces a fixed `openapi-spec.json`.
2. `pnpm run generate` produces the client and Zod schemas for validation from that spec.
3. Build produces a `dist/` suitable for publishing.
4. Tests pass (unit and/or integration tests for the client).
5. Package can be published to npm and consumed with `npm install hevy-api` and a clear, typed API (including how to set the `api-key` header).
