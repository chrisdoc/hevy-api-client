import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("spec fetch", () => {
  const specPath = join(process.cwd(), "openapi-spec.json");

  beforeAll(async () => {
    if (!existsSync(specPath)) {
      const { execSync } = await import("node:child_process");
      execSync("pnpm run fetch-spec", { cwd: process.cwd(), stdio: "pipe" });
    }
  });

  it("produces valid openapi-spec.json", () => {
    expect(existsSync(specPath)).toBe(true);
    const content = readFileSync(specPath, "utf-8");
    const spec = JSON.parse(content);
    expect(spec.openapi).toBeDefined();
    expect(spec.paths).toBeDefined();
    expect(typeof spec.paths).toBe("object");
  });
});
