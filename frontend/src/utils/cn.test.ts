/**
 * =============================================================================
 * Utility Functions Tests
 * =============================================================================
 *
 * Unit tests for common utility functions.
 *
 * @module utils/cn.test
 */

import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatNumber,
  truncate,
  capitalize,
  getInitials,
} from "./cn";

describe("cn - Class Name Utility", () => {
  it("should merge class names", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("should handle false conditionals", () => {
    const isActive = false;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base");
  });

  it("should merge conflicting Tailwind classes", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["px-4", "py-2"]);
    expect(result).toBe("px-4 py-2");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    });
    expect(result).toBe("base active");
  });

  it("should handle undefined and null", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });
});

describe("formatCurrency", () => {
  it("should format number as Indonesian Rupiah", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("Rp");
    expect(result).toContain("1.000.000");
  });

  it("should format zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("Rp");
    expect(result).toContain("0");
  });

  it("should format negative numbers", () => {
    const result = formatCurrency(-500000);
    expect(result).toContain("Rp");
    expect(result).toContain("500.000");
  });

  it("should format decimal numbers without decimals", () => {
    const result = formatCurrency(1500.75);
    expect(result).toContain("1.501"); // Rounded
  });
});

describe("formatNumber", () => {
  it("should format number with thousand separators", () => {
    const result = formatNumber(1000000);
    expect(result).toBe("1.000.000");
  });

  it("should format small numbers", () => {
    const result = formatNumber(999);
    expect(result).toBe("999");
  });

  it("should format zero", () => {
    const result = formatNumber(0);
    expect(result).toBe("0");
  });

  it("should handle decimal numbers", () => {
    const result = formatNumber(1234.56);
    expect(result).toContain("1.234");
  });
});

describe("truncate", () => {
  it("should truncate long strings", () => {
    const result = truncate("This is a very long string", 10);
    expect(result).toBe("This is a ...");
  });

  it("should not truncate short strings", () => {
    const result = truncate("Short", 10);
    expect(result).toBe("Short");
  });

  it("should handle exact length", () => {
    const result = truncate("Exact", 5);
    expect(result).toBe("Exact");
  });

  it("should handle empty string", () => {
    const result = truncate("", 10);
    expect(result).toBe("");
  });
});

describe("capitalize", () => {
  it("should capitalize first letter of each word", () => {
    const result = capitalize("hello world");
    expect(result).toBe("Hello World");
  });

  it("should handle single word", () => {
    const result = capitalize("hello");
    expect(result).toBe("Hello");
  });

  it("should handle already capitalized text", () => {
    const result = capitalize("Hello World");
    expect(result).toBe("Hello World");
  });

  it("should handle empty string", () => {
    const result = capitalize("");
    expect(result).toBe("");
  });

  it("should handle mixed case", () => {
    const result = capitalize("hELLO wORLD");
    expect(result).toBe("HELLO WORLD");
  });
});

describe("getInitials", () => {
  it("should get initials from full name", () => {
    const result = getInitials("John Doe");
    expect(result).toBe("JD");
  });

  it("should handle single name", () => {
    const result = getInitials("John");
    expect(result).toBe("J");
  });

  it("should limit to 2 characters", () => {
    const result = getInitials("John Michael Doe Smith");
    expect(result).toBe("JM");
  });

  it("should handle lowercase names", () => {
    const result = getInitials("john doe");
    expect(result).toBe("JD");
  });

  it("should handle names with multiple spaces", () => {
    const result = getInitials("John  Doe");
    expect(result.length).toBeLessThanOrEqual(2);
  });
});
