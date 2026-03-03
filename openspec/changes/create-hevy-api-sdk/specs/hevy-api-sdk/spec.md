## ADDED Requirements

### Requirement: Spec fetch produces fixed OpenAPI JSON

The system SHALL fetch the Hevy OpenAPI spec from `https://api.hevyapp.com/docs/swagger-ui-init.js`, extract the swaggerDoc object, apply all known fixes (invalid required, enum types, $ref siblings, missing parameter schemas, invalid examples, missing servers, missing global tags, operationIds), and write the result to `openapi-spec.json` in the repo root.

#### Scenario: Fetch script runs successfully

- **WHEN** the user runs `pnpm run fetch-spec` (or equivalent)
- **THEN** the system fetches the swagger-ui-init.js from Hevy
- **AND** extracts and parses the swaggerDoc
- **AND** applies fixOpenAPISpec and all helper fixes
- **AND** writes valid JSON to openapi-spec.json

#### Scenario: Fixed spec is valid for openapi-ts

- **WHEN** openapi-spec.json has been produced by the fetch script
- **THEN** the file SHALL be valid OpenAPI 3.x JSON
- **AND** openapi-ts SHALL accept it as input without schema errors

---

### Requirement: Client generation from fixed spec

The system SHALL generate a TypeScript API client from openapi-spec.json using @hey-api/openapi-ts, with TypeScript types, one HTTP client plugin (Axios or Fetch), and Zod schemas for request/response validation.

#### Scenario: Generate script produces client

- **WHEN** the user runs `pnpm run generate` (or equivalent) after openapi-spec.json exists
- **THEN** openapi-ts SHALL read openapi-spec.json
- **AND** SHALL output generated code to the configured directory (e.g. src/client or src/generated)
- **AND** the output SHALL include TypeScript types, Zod schemas for validation, and HTTP client methods for all Hevy API endpoints

#### Scenario: Resolvers address spec quirks when needed

- **WHEN** generation produces invalid or undesirable Zod/enum output
- **THEN** the system SHALL support adding ~resolvers to the Zod plugin config
- **AND** resolvers SHALL patch output (e.g. permissive enums, custom formats) without forking the plugin

---

### Requirement: Package exposes typed client and API key configuration

The published package SHALL expose a single entry that re-exports the generated client, types, and Zod schemas. The package SHALL document or type how to set the Hevy `api-key` header (via client options or interceptors).

#### Scenario: Consumer can install and import

- **WHEN** a consumer runs `npm install hevy-api`
- **THEN** they SHALL be able to import the client and types from the package
- **AND** the package SHALL include TypeScript declarations (.d.ts)

#### Scenario: Consumer can set API key

- **WHEN** a consumer creates a client instance
- **THEN** they SHALL be able to configure the `api-key` header (via options or interceptors)
- **AND** the mechanism SHALL be documented in README or exposed via types

---

### Requirement: Build produces publishable dist

The system SHALL compile the package to a `dist/` directory containing ESM and .d.ts files. The package.json SHALL set main, module, types, and exports to the built entry, and files SHALL include only dist (or equivalent) so only the client is published.

#### Scenario: Build succeeds

- **WHEN** the user runs the build script (after fetch-spec and generate)
- **THEN** the build SHALL produce dist/ with compiled JS and .d.ts
- **AND** the output SHALL be suitable for npm publish

#### Scenario: Package can be published

- **WHEN** the user runs `npm publish` (or equivalent)
- **THEN** only the dist/ contents (and package.json, README, etc.) SHALL be included
- **AND** consumers SHALL be able to install and use the package from npm

---

### Requirement: Test suite passes before publish

The system SHALL include a test suite (unit and/or integration tests) that tests at least: spec fetch produces valid JSON, client generation runs, generated client can be instantiated with api-key, key endpoints or types are importable. Tests SHALL pass before publish.

#### Scenario: Tests run and pass

- **WHEN** the user runs `pnpm run test` (or equivalent)
- **THEN** the test suite SHALL execute
- **AND** all tests SHALL pass

#### Scenario: Tests cover spec fetch and client

- **WHEN** the test suite runs
- **THEN** at least one test SHALL verify the spec fetch script produces valid openapi-spec.json
- **AND** at least one test SHALL verify the generated client can be instantiated (e.g. with api-key)
