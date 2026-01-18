/**
 * =============================================================================
 * Date Formatter Utility Tests
 * =============================================================================
 *
 * Unit tests for date formatting utilities.
 *
 * @module utils/dateFormatter.test
 */

import { describe, it, expect } from "vitest";
import { toYYYYMMDD } from "./dateFormatter";

describe("dateFormatter", () => {
  describe("toYYYYMMDD", () => {
    it("should format date correctly", () => {
      const date = new Date(2026, 0, 19); // January 19, 2026
      expect(toYYYYMMDD(date)).toBe("2026-01-19");
    });

    it("should pad single digit months", () => {
      const date = new Date(2026, 0, 5); // January 5, 2026
      expect(toYYYYMMDD(date)).toBe("2026-01-05");
    });

    it("should pad single digit days", () => {
      const date = new Date(2026, 8, 3); // September 3, 2026
      expect(toYYYYMMDD(date)).toBe("2026-09-03");
    });

    it("should handle December correctly", () => {
      const date = new Date(2025, 11, 25); // December 25, 2025
      expect(toYYYYMMDD(date)).toBe("2025-12-25");
    });

    it("should return empty string for null", () => {
      expect(toYYYYMMDD(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(toYYYYMMDD(undefined)).toBe("");
    });

    it("should handle date strings", () => {
      const dateStr = "2026-06-15T10:30:00Z";
      const date = new Date(dateStr);
      const result = toYYYYMMDD(date);
      // Result depends on timezone, but should be in YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle end of month dates", () => {
      const date = new Date(2026, 0, 31); // January 31, 2026
      expect(toYYYYMMDD(date)).toBe("2026-01-31");
    });

    it("should handle leap year dates", () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      expect(toYYYYMMDD(date)).toBe("2024-02-29");
    });

    it("should not modify the original date object", () => {
      const originalDate = new Date(2026, 5, 15);
      const originalTime = originalDate.getTime();

      toYYYYMMDD(originalDate);

      expect(originalDate.getTime()).toBe(originalTime);
    });
  });
});
