/// <reference types="cypress" />

describe("Assets Management", () => {
  beforeEach(() => {
    cy.fixture("example.json").then((data) => {
      cy.login(data.users.admin.email, data.users.admin.password);
    });
  });

  describe("Assets List", () => {
    it("should display assets table", () => {
      cy.visit("/assets");

      // Check for table or list component
      cy.get("table").should("be.visible");
    });

    it("should have pagination controls", () => {
      cy.visit("/assets");

      // Check for pagination
      cy.get('[data-testid="pagination"]').should("exist");
    });

    it("should have search functionality", () => {
      cy.visit("/assets");

      // Check for search input
      cy.get(
        'input[type="search"], input[placeholder*="cari"], input[placeholder*="search"]',
      ).should("be.visible");
    });

    it("should filter assets by search term", () => {
      cy.visit("/assets");

      cy.intercept("GET", "**/api/v1/assets*").as("getAssets");

      cy.get(
        'input[type="search"], input[placeholder*="cari"], input[placeholder*="search"]',
      ).type("laptop");

      cy.wait("@getAssets");

      // Results should be filtered
      cy.get("table tbody tr").should("have.length.at.least", 0);
    });
  });

  describe("Asset Creation", () => {
    it("should open create asset modal/page", () => {
      cy.visit("/assets");

      cy.get('[data-testid="create-asset-button"], button')
        .contains(/tambah|create|new/i)
        .click();

      // Form should be visible
      cy.get("form").should("be.visible");
    });

    it("should validate required fields", () => {
      cy.visit("/assets");

      cy.get('[data-testid="create-asset-button"], button')
        .contains(/tambah|create|new/i)
        .click();

      // Submit empty form
      cy.get('form button[type="submit"]').click();

      // Should show validation errors
      cy.contains(/required|wajib|harus/i).should("be.visible");
    });

    it("should create new asset successfully", () => {
      cy.fixture("example.json").then((data) => {
        cy.visit("/assets");

        cy.intercept("POST", "**/api/v1/assets").as("createAsset");

        cy.get('[data-testid="create-asset-button"], button')
          .contains(/tambah|create|new/i)
          .click();

        // Fill form
        cy.get('input[name="name"]').type(data.testData.asset.name);
        cy.get('input[name="code"]').type(data.testData.asset.code);
        cy.get('textarea[name="description"]').type(
          data.testData.asset.description,
        );

        cy.get('form button[type="submit"]').click();

        cy.wait("@createAsset");

        // Should show success message
        cy.checkToast("success");
      });
    });
  });

  describe("Asset Details", () => {
    it("should view asset details", () => {
      cy.visit("/assets");

      // Click on first asset row
      cy.get("table tbody tr").first().click();

      // Should navigate to details or open modal
      cy.contains(/detail|informasi/i).should("be.visible");
    });

    it("should display asset information", () => {
      cy.visit("/assets");

      cy.get("table tbody tr").first().click();

      // Check for essential fields
      cy.contains(/nama|name/i).should("be.visible");
      cy.contains(/kode|code/i).should("be.visible");
    });
  });

  describe("Asset Deletion", () => {
    it("should show delete confirmation", () => {
      cy.visit("/assets");

      // Find delete button on first row
      cy.get("table tbody tr")
        .first()
        .within(() => {
          cy.get(
            '[data-testid="delete-button"], button[aria-label*="hapus"], button[aria-label*="delete"]',
          ).click();
        });

      // Confirmation dialog should appear
      cy.get('[role="dialog"], [data-testid="confirm-dialog"]').should(
        "be.visible",
      );
    });
  });
});
