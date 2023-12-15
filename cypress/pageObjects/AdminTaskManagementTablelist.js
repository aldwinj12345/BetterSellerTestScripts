/// <reference types="cypress" />


class TaskManagementTablelist
{
    verifycolumn1TemplateName(locator, name)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .then((cName)=>{
            expect(cName.text().trim()).to.equal(name)
          })
    }
    verifycolumn2PartnerType(locator, name)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.text', name)
    }
    verifycolumn3ServiceType(locator, name)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.text', name)
    }
    verifycolumn4LastUpdated(locator, date)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and('contain', date)
    }
    verifycolumn5UpdatedBy(locator, initial, name)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .then(()=>{
            cy.get(' > td:nth-child(5) > div > span')  //account specialist name
              .should('exist')
              .and('be.visible')
              .then((txt)=>{
                expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal(name)
              })  
            cy.get(' > td:nth-child(5) > div > div > div > span')  //the initial logo
              .should('exist')
              .and('be.visible')
              .and('have.text', initial)
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
          })
    }
    verifycolumn6ActionEdit(locator, enabled_disabled, name)
    {
        cy.get(locator)
          .should('exist')
          .and('be.visible')
          .and(enabled_disabled)
          .and('have.css', 'font-weight', '700')                  //font bold
          .and('have.css', 'color','rgb(148, 148, 148)')          //text color
          .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
          .then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal(name)
          })   
    }
}
export default TaskManagementTablelist;