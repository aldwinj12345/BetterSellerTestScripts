// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-file-upload'
import 'cypress-iframe';
require('cypress-iframe');

Cypress.Commands.add('userloginaccount', (unlocator, pwlocator, submitbuttonlocator, username, password) => {
    cy.get(unlocator).type(username)
    cy.get(pwlocator).type(password)
    cy.get(submitbuttonlocator).click()
      .wait(5000)
})


Cypress.Commands.add('verifyEachNameonTheList', (locator, listOptions) => {
  cy.get(locator).each(($option, index) => {
    cy.wrap($option).realHover()  //verify names based on the expected options
      .should('exist')
      .and('be.visible')
      .and('have.text', listOptions[index])
      .and('have.css', 'color', 'rgb(255, 255, 255)')           //text color
      .and('have.css', 'background-color', 'rgb(239, 68, 68)')  //background color when hover
  });
});

Cypress.Commands.add('getMessagepopup', (locator, message) => {
  cy.get(locator)
    .should('exist')
    .and('be.visible')
    .and('contain', message)
})