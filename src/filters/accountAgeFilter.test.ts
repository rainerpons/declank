import { calculateCutoffTimestamp, isAccountYoungerThan } from "@/filters/accountAgeFilter";

describe("accountAgeFilter", () => {
  describe("calculateCutoffTimestamp", () => {
    it("calculates cutoff for days", () => {
      const now = new Date("2023-10-15T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const cutoff = calculateCutoffTimestamp(30, "day");
      const expected = new Date("2023-09-15T12:00:00Z").getTime() / 1000;
      expect(cutoff).toBeCloseTo(expected, 0);
      vi.useRealTimers();
    });

    it("calculates cutoff for weeks", () => {
      const now = new Date("2023-10-15T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const cutoff = calculateCutoffTimestamp(2, "week");
      const expected = new Date("2023-10-01T12:00:00Z").getTime() / 1000;
      expect(cutoff).toBeCloseTo(expected, 0);
      vi.useRealTimers();
    });

    it("calculates cutoff for months", () => {
      const now = new Date("2023-10-15T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const cutoff = calculateCutoffTimestamp(6, "month");
      const expected = new Date("2023-04-15T12:00:00Z").getTime() / 1000;
      expect(cutoff).toBeCloseTo(expected, 0);
      vi.useRealTimers();
    });

    it("calculates cutoff for years", () => {
      const now = new Date("2023-10-15T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const cutoff = calculateCutoffTimestamp(1, "year");
      const expected = new Date("2022-10-15T12:00:00Z").getTime() / 1000;
      expect(cutoff).toBeCloseTo(expected, 0);
      vi.useRealTimers();
    });

    it("handles leap years", () => {
      const now = new Date("2024-02-29T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const cutoff = calculateCutoffTimestamp(1, "year");
      // Javascript's setFullYear(2023) on Feb 29 results in Mar 1 2023
      const expected = new Date("2023-03-01T12:00:00Z").getTime() / 1000;
      expect(cutoff).toBeCloseTo(expected, 0);
      vi.useRealTimers();
    });
  });

  describe("isAccountYoungerThan", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2023-10-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true for account created yesterday with 30-day threshold", () => {
      const yesterday = new Date("2023-10-14T12:00:00Z").getTime() / 1000;
      expect(isAccountYoungerThan(yesterday, 30, "day")).toBe(true);
    });

    it("returns false for account created 2 years ago with 1-year threshold", () => {
      const twoYearsAgo = new Date("2021-10-15T12:00:00Z").getTime() / 1000;
      expect(isAccountYoungerThan(twoYearsAgo, 1, "year")).toBe(false);
    });

    it("returns false for account created exactly at cutoff boundary", () => {
      const cutoff = calculateCutoffTimestamp(30, "day");
      expect(isAccountYoungerThan(cutoff, 30, "day")).toBe(false);
    });

    it("returns false if createdUtc is missing", () => {
      expect(isAccountYoungerThan(undefined, 30, "day")).toBe(false);
    });

    it("returns true for future timestamp", () => {
      const future = new Date("2023-10-16T12:00:00Z").getTime() / 1000;
      expect(isAccountYoungerThan(future, 30, "day")).toBe(true);
    });

    it("handles threshold changes", () => {
      const createdUtc = new Date("2023-01-15T12:00:00Z").getTime() / 1000;
      expect(isAccountYoungerThan(createdUtc, 1, "year")).toBe(true);
      expect(isAccountYoungerThan(createdUtc, 6, "month")).toBe(false);
    });
  });
});
