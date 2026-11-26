import { describe, expect, it } from "vitest";
import {
  cancelRelease,
  initialPolicy,
  policyErrors,
  seedCapsules,
} from "./domain";
describe("configuration gates", () => {
  it("rejects a threshold above accepted trustees even if more invitations exist", () =>
    expect(policyErrors({ ...initialPolicy, threshold: 3 }, 2)).toHaveLength(
      1,
    ));
  it("rejects unavailable check-in channels and invalid limits", () =>
    expect(
      policyErrors(
        {
          ...initialPolicy,
          telegram: false,
          sms: false,
          interval: 0,
          waiting: 61,
        },
        3,
      ),
    ).toHaveLength(3));
  it("accepts boundary values with enough trustees", () =>
    expect(
      policyErrors(
        { ...initialPolicy, interval: 180, waiting: 60, threshold: 5 },
        5,
      ),
    ).toEqual([]));
});
describe("owner cancellation UI model", () => {
  it.each(["waiting", "paused"] as const)(
    "cancels %s without mutating the original",
    (phase) => {
      const c = { ...seedCapsules[0], phase };
      expect(cancelRelease(c).phase).toBe("active");
      expect(c.phase).toBe(phase);
    },
  );
  it("rejects cancellation when no release is pending", () =>
    expect(() => cancelRelease(seedCapsules[0])).toThrow());
});
