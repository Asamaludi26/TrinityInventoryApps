/// <reference types="cypress" />

describe("Request Management", () => {
  beforeEach(() => {
    cy.fixture("example.json").then((data) => {
      cy.login(data.users.admin.email, data.users.admin.password);
    });
  });

  describe("Requests List", () => {
    it("should display requests table", () => {
      cy.visit("/requests");

      cy.get("table").should("be.visible");
    });

    it("should filter by status", () => {
      cy.visit("/requests");

      // Find status filter
      cy.get('[data-testid="status-filter"], select').first().click();
      cy.contains(/pending|menunggu/i).click();

      // Results should update
      cy.get("table tbody").should("exist");
    });

    it("should show request details on click", () => {
      cy.visit("/requests");

      cy.get("table tbody tr").first().click();

      // Details should be visible
      cy.contains(/detail|status|tujuan/i).should("be.visible");
    });
  });

  describe("Create Request", () => {
    it("should open new request form", () => {
      cy.visit("/requests");

      cy.get("button")
        .contains(/tambah|buat|create|new/i)
        .click();

      cy.get("form").should("be.visible");
    });

    it("should submit new request", () => {
      cy.fixture("example.json").then((data) => {
        cy.visit("/requests");

        cy.intercept("POST", "**/api/v1/requests").as("createRequest");

        cy.get("button")
          .contains(/tambah|buat|create|new/i)
          .click();

        // Fill in request form
        cy.get('textarea[name="purpose"], textarea[name="tujuan"]').type(
          data.testData.request.purpose,
        );
        cy.get('textarea[name="notes"], textarea[name="catatan"]').type(
          data.testData.request.notes,
        );

        // Select asset (if applicable)
        cy.get('[data-testid="asset-select"], select[name="assetId"]')
          .first()
          .click();
        cy.get('[data-testid="asset-option"]').first().click();

        cy.get('form button[type="submit"]').click();

        cy.wait("@createRequest");

        cy.checkToast("success");
      });
    });
  });

  describe("Request Actions", () => {
    it("should approve request (as admin)", () => {
      cy.visit("/requests");

      cy.intercept("PATCH", "**/api/v1/requests/*/approve").as(
        "approveRequest",
      );

      // Find pending request and approve
      cy.contains("tr", /pending|menunggu/i).within(() => {
        cy.get("button")
          .contains(/approve|setuju/i)
          .click();
      });

      cy.wait("@approveRequest");
      cy.checkToast("success");
    });

    it("should reject request with reason", () => {
      cy.visit("/requests");

      cy.intercept("PATCH", "**/api/v1/requests/*/reject").as("rejectRequest");

      // Find pending request and reject
      cy.contains("tr", /pending|menunggu/i).within(() => {
        cy.get("button")
          .contains(/reject|tolak/i)
          .click();
      });

      // Fill in rejection reason
      cy.get('[data-testid="reject-reason"], textarea').type("Not in stock");
      cy.get("button")
        .contains(/confirm|konfirmasi|submit/i)
        .click();

      cy.wait("@rejectRequest");
      cy.checkToast("success");
    });
  });

  describe("Request Workflow", () => {
    it("should complete full request workflow", () => {
      cy.fixture("example.json").then((data) => {
        // Step 1: Create request as staff
        cy.login(data.users.staff.email, data.users.staff.password);
        cy.visit("/requests");

        cy.intercept("POST", "**/api/v1/requests").as("createRequest");

        cy.get("button")
          .contains(/tambah|buat|create|new/i)
          .click();
        cy.get('textarea[name="purpose"]').type("Workflow Test Request");
        cy.get('form button[type="submit"]').click();

        cy.wait("@createRequest").then((interception) => {
          const requestId = interception.response?.body?.id;

          // Step 2: Approve as admin
          cy.login(data.users.admin.email, data.users.admin.password);
          cy.visit("/requests");

          cy.intercept("PATCH", `**/api/v1/requests/${requestId}/approve`).as(
            "approveRequest",
          );

          cy.contains("tr", "Workflow Test Request").within(() => {
            cy.get("button")
              .contains(/approve|setuju/i)
              .click();
          });

          cy.wait("@approveRequest");
          cy.checkToast("success");
        });
      });
    });
  });
});
