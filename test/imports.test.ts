import { describe, it, expect } from "vitest";

describe("imports", () => {
  it("can import client and createClient", async () => {
    const mod = await import("hevy-api-client");
    expect(mod.client).toBeDefined();
    expect(mod.createClient).toBeDefined();
    expect(mod.createConfig).toBeDefined();
    expect(mod.configureClient).toBeDefined();
  });

  it("can import SDK functions", async () => {
    const mod = await import("hevy-api-client");
    expect(mod.getV1Workouts).toBeDefined();
    expect(mod.getV1UserInfo).toBeDefined();
  });

  it("can import Zod schemas", async () => {
    const mod = await import("hevy-api-client");
    expect(mod.zWorkout).toBeDefined();
    expect(mod.zUserInfo).toBeDefined();
  });
});
