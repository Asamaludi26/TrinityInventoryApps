// ***********************************************
// Custom commands for Trinity Inventory Apps
// ***********************************************

/// <reference types="cypress" />

// Login command
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should("not.include", "/login");
    },
    {
      validate: () => {
        cy.window().its("localStorage.token").should("exist");
      },
    },
  );
});

// Get by test ID
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// API login - faster than UI login
Cypress.Commands.add("apiLogin", (email: string, password: string) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem("token", response.body.accessToken);
    window.localStorage.setItem("refreshToken", response.body.refreshToken);
  });
});

// Intercept and wait for API
Cypress.Commands.add(
  "interceptApi",
  (method: string, path: string, alias: string) => {
    cy.intercept(method, `${Cypress.env("apiUrl")}${path}`).as(alias);
  },
);

// Check toast notification
Cypress.Commands.add(
  "checkToast",
  (message: string, type: "success" | "error" = "success") => {
    cy.get('[role="alert"]').should("be.visible").and("contain.text", message);
  },
);

// Declare global Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login via UI with session caching
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Get element by data-testid attribute
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Login via API (faster)
       */
      apiLogin(email: string, password: string): Chainable<void>;

      /**
       * Intercept API requests
       */
      interceptApi(
        method: string,
        path: string,
        alias: string,
      ): Chainable<void>;

      /**
       * Check toast notification
       */
      checkToast(message: string, type?: "success" | "error"): Chainable<void>;
    }
  }
}

export {};
