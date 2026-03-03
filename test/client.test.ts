import { describe, it, expect } from "vitest";
import {
  configureClient,
  getV1Workouts,
  getV1UserInfo,
  type Workout,
  type UserInfo,
} from "hevy-api-client";

describe("client", () => {
  it("can be configured with api-key from env", () => {
    const apiKey = process.env.API_KEY ?? "test-key";
    configureClient({ apiKey });
    expect(apiKey).toBeDefined();
  });

  it("exports SDK functions", () => {
    expect(typeof getV1Workouts).toBe("function");
    expect(typeof getV1UserInfo).toBe("function");
  });

  it("exports types", () => {
    const _workout: Workout = {} as Workout;
    const _user: UserInfo = {} as UserInfo;
    expect(_workout).toBeDefined();
    expect(_user).toBeDefined();
  });
});
