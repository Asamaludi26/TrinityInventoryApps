/**
 * =============================================================================
 * Auth Schema Validation Tests
 * =============================================================================
 *
 * Unit tests for authentication validation schemas using Zod.
 *
 * @module validation/schemas/auth.schema.test
 */

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  adminResetPasswordSchema,
} from "./auth.schema";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "user@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email");
      }
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("email");
      }
    });

    it("should reject password less than 6 characters", () => {
      const invalidData = {
        email: "user@example.com",
        password: "12345",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("6");
      }
    });

    it("should reject missing fields", () => {
      const invalidData = {};

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("changePasswordSchema", () => {
    it("should validate correct password change data", () => {
      const validData = {
        currentPassword: "oldPassword123",
        newPassword: "NewPass123",
        confirmPassword: "NewPass123",
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject new password without uppercase", () => {
      const invalidData = {
        currentPassword: "oldPassword123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject new password without lowercase", () => {
      const invalidData = {
        currentPassword: "oldPassword123",
        newPassword: "NEWPASSWORD123",
        confirmPassword: "NEWPASSWORD123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject new password without number", () => {
      const invalidData = {
        currentPassword: "oldPassword123",
        newPassword: "NewPassword",
        confirmPassword: "NewPassword",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject mismatched confirm password", () => {
      const invalidData = {
        currentPassword: "oldPassword123",
        newPassword: "NewPass123",
        confirmPassword: "DifferentPass123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("confirmPassword")),
        ).toBe(true);
      }
    });

    it("should reject when new password equals current password", () => {
      const invalidData = {
        currentPassword: "SamePass123",
        newPassword: "SamePass123",
        confirmPassword: "SamePass123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        currentPassword: "oldPassword123",
        newPassword: "Short1",
        confirmPassword: "Short1",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("passwordResetRequestSchema", () => {
    it("should validate correct email", () => {
      const validData = {
        email: "user@example.com",
      };

      const result = passwordResetRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "not-an-email",
      };

      const result = passwordResetRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("adminResetPasswordSchema", () => {
    it("should validate correct admin reset password data", () => {
      const validData = {
        newPassword: "NewPass123",
        confirmPassword: "NewPass123",
      };

      const result = adminResetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const invalidData = {
        newPassword: "NewPass123",
        confirmPassword: "Different123",
      };

      const result = adminResetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should enforce password complexity rules", () => {
      const weakPasswords = ["password", "PASSWORD123", "Password"];

      weakPasswords.forEach((pass) => {
        const invalidData = {
          newPassword: pass,
          confirmPassword: pass,
        };

        const result = adminResetPasswordSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});
