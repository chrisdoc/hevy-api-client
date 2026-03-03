import "dotenv/config";
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    alias: {
      "hevy-api-client": resolve(__dirname, "src/index.ts"),
    },
  },
});
