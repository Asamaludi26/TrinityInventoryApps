/**
 * =============================================================================
 * User Schema Validation Tests
 * =============================================================================
 *
 * Unit tests for user management validation schemas.
 *
 * @module validation/schemas/user.schema.test
 */

import { describe, it, expect } from "vitest";
import { userRoleSchema, createUserSchema } from "./user.schema";

describe("User Validation Schemas", () => {
  describe("userRoleSchema", () => {
    it("should validate correct user roles", () => {
      const validRoles = [
        "Super Admin",
        "Admin Logistik",
        "Admin Purchase",
        "Leader",
        "Staff",
      ];

      validRoles.forEach((role) => {
        const result = userRoleSchema.safeParse(role);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid roles", () => {
      const invalidRoles = ["admin", "ADMIN", "Manager", "User", ""];

      invalidRoles.forEach((role) => {
        const result = userRoleSchema.safeParse(role);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("createUserSchema", () => {
    const validUser = {
      name: "John Doe",
      email: "john@example.com",
      role: "Staff" as const,
      divisionId: 1,
      permissions: [],
    };

    it("should validate correct user data", () => {
      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should validate user with null divisionId", () => {
      const userWithNullDivision = {
        ...validUser,
        divisionId: null,
      };

      const result = createUserSchema.safeParse(userWithNullDivision);
      expect(result.success).toBe(true);
    });

    it("should validate user with password", () => {
      const userWithPassword = {
        ...validUser,
        password: "SecurePass123",
      };

      const result = createUserSchema.safeParse(userWithPassword);
      expect(result.success).toBe(true);
    });

    describe("name validation", () => {
      it("should reject name shorter than 2 characters", () => {
        const invalidUser = { ...validUser, name: "A" };

        const result = createUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("2");
        }
      });

      it("should reject name longer than 100 characters", () => {
        const invalidUser = { ...validUser, name: "A".repeat(101) };

        const result = createUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("100");
        }
      });

      it("should reject empty name", () => {
        const invalidUser = { ...validUser, name: "" };

        const result = createUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });
    });

    describe("email validation", () => {
      it("should reject invalid email format", () => {
        const invalidEmails = [
          "not-an-email",
          "missing@domain",
          "@nodomain.com",
          "spaces in@email.com",
        ];

        invalidEmails.forEach((email) => {
          const invalidUser = { ...validUser, email };
          const result = createUserSchema.safeParse(invalidUser);
          expect(result.success).toBe(false);
        });
      });

      it("should accept valid email formats", () => {
        const validEmails = [
          "user@example.com",
          "user.name@example.com",
          "user+tag@example.co.id",
        ];

        validEmails.forEach((email) => {
          const userData = { ...validUser, email };
          const result = createUserSchema.safeParse(userData);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("password validation", () => {
      it("should reject weak passwords", () => {
        const weakPasswords = [
          "short", // Too short
          "lowercase123", // No uppercase
          "UPPERCASE123", // No lowercase
          "NoNumbers", // No numbers
        ];

        weakPasswords.forEach((password) => {
          const userWithWeakPassword = { ...validUser, password };
          const result = createUserSchema.safeParse(userWithWeakPassword);
          expect(result.success).toBe(false);
        });
      });

      it("should accept strong passwords", () => {
        const strongPasswords = ["SecurePass1", "MyPassword123", "Test1234Abc"];

        strongPasswords.forEach((password) => {
          const userWithStrongPassword = { ...validUser, password };
          const result = createUserSchema.safeParse(userWithStrongPassword);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("role validation", () => {
      it("should reject invalid roles", () => {
        const invalidUser = { ...validUser, role: "InvalidRole" };

        const result = createUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });
    });
  });
});
