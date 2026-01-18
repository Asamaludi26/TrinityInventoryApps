/// <reference types="cypress" />

describe("Authentication Flow", () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Login Page", () => {
    it("should display login form", () => {
      cy.visit("/login");

      cy.get('input[name="email"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });

    it("should show validation errors for empty fields", () => {
      cy.visit("/login");

      cy.get('button[type="submit"]').click();

      // Check for validation messages
      cy.contains(/email|required/i).should("be.visible");
    });

    it("should show error for invalid credentials", () => {
      cy.visit("/login");

      cy.get('input[name="email"]').type("invalid@email.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      // Should show error message
      cy.contains(/invalid|gagal|salah/i).should("be.visible");
    });

    it("should redirect to dashboard on successful login", () => {
      cy.fixture("example.json").then((data) => {
        cy.visit("/login");

        cy.get('input[name="email"]').type(data.users.admin.email);
        cy.get('input[name="password"]').type(data.users.admin.password);
        cy.get('button[type="submit"]').click();

        // Should redirect to dashboard
        cy.url().should("include", "/dashboard");
      });
    });
  });

  describe("Logout Flow", () => {
    beforeEach(() => {
      cy.fixture("example.json").then((data) => {
        cy.login(data.users.admin.email, data.users.admin.password);
      });
    });

    it("should logout successfully", () => {
      cy.visit("/dashboard");

      // Find and click logout button (adjust selector based on actual UI)
      cy.get('[data-testid="user-menu"]').click();
      cy.contains(/logout|keluar/i).click();

      // Should redirect to login
      cy.url().should("include", "/login");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect to login when accessing protected route without auth", () => {
      cy.visit("/dashboard");

      // Should redirect to login
      cy.url().should("include", "/login");
    });

    it("should access dashboard when authenticated", () => {
      cy.fixture("example.json").then((data) => {
        cy.login(data.users.admin.email, data.users.admin.password);
        cy.visit("/dashboard");

        // Should stay on dashboard
        cy.url().should("include", "/dashboard");
      });
    });
  });
});
