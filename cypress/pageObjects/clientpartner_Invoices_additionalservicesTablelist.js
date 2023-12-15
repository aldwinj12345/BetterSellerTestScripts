/// <reference types="cypress" />

class additionalservices
{
    verifyrow1column1InvoiceNumber(locator, invoicenumber)
    {
        cy.get(locator)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('contain', invoicenumber)
        .and('have.attr', 'href').and('include', '/additional-services/')
    }
    verifyrow1column2Service(locator, servicename)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.text', servicename)
          .and('have.css', 'text-transform', 'uppercase')
    }
    verifyrow1column3Amount(locator, amount)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .then((el) => {
            const computedStyle       = getComputedStyle(el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
                //expected text
            expect(el.text().replace(/\s+/g, ' ').trim()).to.equal(amount)
          })
          .find(' > span')
            .should('exist')
            .and('be.visible')
            .and('have.text', '$')
            .and('have.css', 'color', 'rgb(190, 190, 190)')  //text color
    }
    verifyrow1column4Status(locator, status, textColor, bColor)
    {
        cy.get(locator)
            .should('exist')
            .and('be.visible')
            .and('have.text', status)
            .and('have.css', 'text-transform', 'capitalize')  //only the first letter is capitalize
            .and('have.css', 'color', textColor)   //text color
            .and('have.css', 'background-color', bColor)        // background color that form into capsule
            .and('have.css', 'border-radius', '9999px')         // edge curve that form into capsule
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
    }
    verifyrow1column5Date(locator, date)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and('contain', date)
    }
    verifyrow1column6Action(locator, enabled_disabled, name)
    {
        cy.get(locator).scrollIntoView()
          .should('exist')
          .should('be.visible')
          .and(enabled_disabled)
          .and('have.text', name)
          .and('have.css', 'font-weight', '700')                  //font bold
          .and('have.css', 'color','rgb(148, 148, 148)')          //text color
          .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
          .and('have.css', 'border-radius', '8px')     
    }
}
export default additionalservices;