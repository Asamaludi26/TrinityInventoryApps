/// <reference types="cypress" />

describe("Dashboard", () => {
  beforeEach(() => {
    cy.fixture("example.json").then((data) => {
      cy.login(data.users.admin.email, data.users.admin.password);
    });
  });

  describe("Dashboard Overview", () => {
    it("should display dashboard widgets", () => {
      cy.visit("/dashboard");

      // Check for main dashboard components
      cy.contains(/dashboard|beranda/i).should("be.visible");
    });

    it("should display statistics cards", () => {
      cy.visit("/dashboard");

      // Common dashboard stats
      cy.get('[data-testid="stats-card"]').should("have.length.at.least", 1);
    });

    it("should display recent activities", () => {
      cy.visit("/dashboard");

      // Check for recent activity section
      cy.contains(/recent|terbaru|aktivitas/i).should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("should navigate to assets page", () => {
      cy.visit("/dashboard");

      cy.get('[data-testid="nav-assets"]').click();
      cy.url().should("include", "/assets");
    });

    it("should navigate to requests page", () => {
      cy.visit("/dashboard");

      cy.get('[data-testid="nav-requests"]').click();
      cy.url().should("include", "/requests");
    });

    it("should have working sidebar navigation", () => {
      cy.visit("/dashboard");

      // Check sidebar is visible
      cy.get('[data-testid="sidebar"]').should("be.visible");

      // Check navigation items exist
      cy.get('[data-testid="sidebar"] a').should("have.length.at.least", 3);
    });
  });

  describe("Responsive Design", () => {
    it("should display correctly on mobile", () => {
      cy.viewport("iphone-x");
      cy.visit("/dashboard");

      // Mobile menu should be available
      cy.get('[data-testid="mobile-menu-button"]').should("be.visible");
    });

    it("should display correctly on tablet", () => {
      cy.viewport("ipad-2");
      cy.visit("/dashboard");

      // Dashboard should render properly
      cy.contains(/dashboard|beranda/i).should("be.visible");
    });

    it("should display correctly on desktop", () => {
      cy.viewport(1920, 1080);
      cy.visit("/dashboard");

      // Sidebar should be visible on desktop
      cy.get('[data-testid="sidebar"]').should("be.visible");
    });
  });
});
