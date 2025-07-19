# GEMINI.md

This file contains information relevant to the Gemini CLI agent for the `hevy-api-client` project.

## Project Overview

This project is a TypeScript HTTP client SDK for the Hevy API, generated from its OpenAPI specification. The client aims to provide a user-friendly interface for interacting with the Hevy API.

## Key Tools and Technologies

- **`@hey-api/openapi-ts`**: Used for generating the TypeScript client from the OpenAPI specification.
- **`tsup`**: Used for bundling the client for npm publication (ESM, CJS, and type declarations).
- **`husky` & `commitlint`**: Used to enforce conventional commit messages for a clean Git history.

## Project-Specific Commands

- `npm run fetch-spec`: Fetches the latest OpenAPI specification from its source.
- `npm run generate-client`: Regenerates the TypeScript client from the OpenAPI specification. The generated code is placed in `src/generated/`.
- `npm run build`: Builds the client for npm publication, outputting to the `dist/` directory.

## Conventions and Best Practices

- **Generated Code Location**: All generated API client code resides in `src/generated/`.
- **API Key Handling**: The `HevyAPIClient` constructor requires an `apiKey` and automatically includes it in the `api-key` header for all requests. It also merges any additional headers provided in the options.
- **Base URL**: The default base URL for the Hevy API is hardcoded to `https://api.hevyapp.com`, but can be overridden during client instantiation.
- **Commit Messages**: Conventional Commits are enforced using `commitlint`.

## Agent Notes

- When generating the client, ensure the `--output src/generated` flag is used.
- Remember to update import paths in `src/index.ts` if the generated code's location changes.
- The `ClientOptions` type from `@hey-api/openapi-ts` does not directly expose a `headers` property; headers are passed directly to `createClient`.
- Always ensure all work is committed to the repository.
