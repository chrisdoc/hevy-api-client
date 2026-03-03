import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi-spec.json",
  output: "src/client",
  plugins: [
    "@hey-api/client-axios",
    "zod",
    {
      name: "@hey-api/sdk",
      validator: { request: false, response: true },
    },
  ],
});
