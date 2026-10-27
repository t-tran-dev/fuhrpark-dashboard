import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats an ISO date as a German date", () => {
    expect(formatDate("2026-11-03")).toBe("03.11.2026");
  });
});
