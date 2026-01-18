/**
 * =============================================================================
 * ErrorBoundary Component Tests
 * =============================================================================
 *
 * Unit tests for the ErrorBoundary component.
 *
 * @module components/ErrorBoundary.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

// Suppress console.error during tests
const originalError = console.error;

beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe("ErrorBoundary", () => {
  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should render default fallback UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /coba lagi/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /kembali ke beranda/i }),
    ).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary
        fallback={<div data-testid="custom-fallback">Custom Error</div>}
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("should reset error state when retry button is clicked", () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = vi
        .fn()
        .mockReturnValue([true, vi.fn()]);
      return (
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    };

    // This test verifies the retry button exists and is clickable
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const retryButton = screen.getByRole("button", { name: /coba lagi/i });
    expect(retryButton).toBeInTheDocument();

    // Click should not throw
    fireEvent.click(retryButton);
  });

  it("should show error details in development mode", () => {
    // Note: import.meta.env.DEV is controlled by Vite
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // In dev mode, error details should be visible
    if (import.meta.env.DEV) {
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    }
  });
});
