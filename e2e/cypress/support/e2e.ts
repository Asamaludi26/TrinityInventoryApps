// ***********************************************************
// This file is processed and loaded automatically before test files.
// Use it to put global configuration and behavior that modifies Cypress.
//
// Read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (
  app &&
  !app.document.head.querySelector("[data-hide-command-log-request]")
) {
  const style = app.document.createElement("style");
  style.setAttribute("data-hide-command-log-request", "");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  app.document.head.appendChild(style);
}

// Disable uncaught exception handling to prevent test failures on app errors
Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from failing the test
  return false;
});
