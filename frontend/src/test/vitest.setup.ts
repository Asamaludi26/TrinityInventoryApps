/**
 * =============================================================================
 * Vitest Test Setup
 * =============================================================================
 *
 * Global test setup for frontend React tests with Vitest.
 *
 * @module test/vitest.setup
 * @version 1.0.0
 * @created 2026-01-19
 */

import "@testing-library/jest-dom";

// Mock window.matchMedia for tests that use responsive hooks
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock scrollTo
window.scrollTo = () => {};

// Suppress console errors during tests (optional)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (args[0]?.includes?.('Warning:')) return;
//     originalError.apply(console, args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });
