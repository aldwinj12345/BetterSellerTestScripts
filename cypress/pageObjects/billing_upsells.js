/// <reference types="cypress" />

class billingupsells
{
    verifyrow1column1Servicename(locator, servicename)
    {
        cy.get(locator)
          .should('exist')
          .and('not.be.disabled')
          .then((cName)=>{
            expect(cName.text().trim()).to.equal(servicename)
          })
    }
    verifyrow1column2Clientname(locator, name)
    {
        cy.get(locator)
          .should('exist')
          .and('not.be.disabled')
          .then((cName)=>{
            expect(cName.text().trim()).to.equal(name)
          })
    }
    verifyrow1column3Amount(locator, amount)
    {
        cy.get(locator)
          .should('exist')
          .then((el) => {
            const computedStyle       = getComputedStyle(el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
                //expected text
            expect(el.text().replace(/\s+/g, ' ').trim()).to.equal(amount)
          })
          .find(' > span')
            .should('exist')
            .and('have.text', '$')
            .and('have.css', 'color', 'rgb(190, 190, 190)')  //text color
    }
    verifyrow1column3CN(locator, cnnumber){
      {
        cy.get(locator)
          .should('exist')
          .and('contain', cnnumber)
    }
    }
    verifyrow1column4Status(locator, status, textColor, bColor)
    {
        cy.get(locator)
            .should('exist')
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
    verifyrow1column4InvoiceNumber(locator)
    {
      cy.get(locator)
        .should('exist')
        .and('not.be.disabled')
        .and('contain', 'INV')
        .and('have.attr', 'href').and('include', '/invoices/')
    }
    verifyrow1column5Date(locator, date)
    {
        cy.get(locator)
          .should('exist')
          .and('contain', date)
    }
    verifyrow1column5Status(locator, status, textColor, bColor)
    {
      cy.get(locator)
        .should('exist')
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
    verifyrow1column6Submittedby(locator, initial, name)
    {
        cy.get(locator)
          .should('exist')
          .then(()=>{
            cy.get(' > td:nth-child(6) > div > span')  //account specialist name
              .should('exist')
              .and('have.text', name)
            cy.get(' > td:nth-child(6) > div > div > div > span')  //the initial logo
              .should('exist')
              .and('have.text', initial)
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
              .and('have.css', 'width', '36px')
              .and('have.css', 'height', '36px')
          })
    }
    verifyrowcolumn7Submittedby(locator, initial, name)
    {
      cy.get(locator)
          .should('exist')
          .then(()=>{
            cy.get(' > td:nth-child(7) > div > span')  //account specialist name
              .should('exist')
              .and('have.text', name)
            cy.get(' > td:nth-child(7) > div > div > div > span')  //the initial logo
              .should('exist')
              .and('have.text', initial)
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
              .and('have.css', 'width', '36px')
              .and('have.css', 'height', '36px')
          })
    }
    verifyrow1column8Submittedby(locator, initial, name)
    {
        cy.get(locator)
          .should('exist')
          .then(()=>{
            cy.get(' > td:nth-child(8) > div > span')  //account specialist name
              .should('exist')
              .and('have.text', name)
            cy.get(' > td:nth-child(8) > div > div > div > span')  //the initial logo
              .should('exist')
              .and('have.text', initial)
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
              .and('have.css', 'width', '36px')
              .and('have.css', 'height', '36px')
          })
    }
    verifyrow1column7Action(locator, enabled_disabled, name)
    {
      cy.get(locator)
          .should('exist')
          .and(enabled_disabled)
          .and('have.css', 'font-weight', '700')                  //font bold
          .and('have.css', 'color','rgb(148, 148, 148)')          //text color
          .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
          .and('have.css', 'border-radius', '12px')               //the curve edge of the button
          .then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal(name)
          })
    }
    verifyrow1column7AtRejectedtabRejector(locator, initial, projectmanagerName)
    {
      cy.get(locator)
          .should('exist')
          .then(()=>{
            cy.get(' > td:nth-child(7) > div > span')  //project manager name
              .should('exist')
              .and('have.text', projectmanagerName)
            cy.get(' > td:nth-child(7) > div > div > div > span')  //the initial logo
              .should('exist')
              .and('have.text', initial)
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
              .and('have.css', 'width', '36px')
              .and('have.css', 'height', '36px')
          })
    }
    verifyrow1column7Approver(locator, initial, projectmanagerName)
    {
      cy.get(locator)
      .should('exist')
      .then(()=>{
        cy.get(' > td:nth-child(7) > div > span')  //project manager name
          .should('exist')
          .and('have.text', projectmanagerName)
        cy.get(' > td:nth-child(7) > div > div > div > span')  //the initial logo
          .should('exist')
          .and('have.text', initial)
          .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
          .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
          .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
          .and('have.css', 'width', '36px')
          .and('have.css', 'height', '36px')
      })
    }
    verifyrow1column8Approver(locator, initial, projectmanagerName)
    {
      cy.get(locator)
      .should('exist')
      .then(()=>{
        cy.get(' > td:nth-child(8) > div > span')  //project manager name
          .should('exist')
          .and('have.text', projectmanagerName)
        cy.get(' > td:nth-child(8) > div > div > div > span')  //the initial logo
          .should('exist')
          .and('have.text', initial)
          .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
          .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
          .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
          .and('have.css', 'width', '36px')
          .and('have.css', 'height', '36px')
      })
    }
    verifyrow1column8Action(locator, enabled_disabled, name)
    {
      cy.get(locator)
          .should('exist')
          .and(enabled_disabled)
          .and('have.css', 'font-weight', '700')                  //font bold
          .and('have.css', 'color','rgb(148, 148, 148)')          //text color
          .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
          .and('have.css', 'border-radius', '12px')
          .then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal(name)
          })               //the curve edge of the button
    }
    verifyrow1column9Action(locator, enabled_disabled, name)
    {
      cy.get(locator).scrollIntoView()
          .should('exist')
          .and(enabled_disabled)
          .and('have.css', 'font-weight', '700')                  //font bold
          .and('have.css', 'color','rgb(148, 148, 148)')          //text color
          .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
          .and('have.css', 'border-radius', '12px')               //the curve edge of the button
          .then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal(name)
          })
    }
    verifyrow1column9Approver(locator, initial, projectmanagerName)
    {
      cy.get(locator)
      .should('exist')
      .then(()=>{
        cy.get(' > td:nth-child(9) > div > span')  //project manager name
          .should('exist')
          .and('have.text', projectmanagerName)
        cy.get(' > td:nth-child(9) > div > div > div > span')  //the initial logo
          .should('exist')
          .and('have.text', initial)
          .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
          .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
          .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
      })
    }
}
export default billingupsells;