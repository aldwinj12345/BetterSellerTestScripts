/// <reference types="cypress" />

class fortermination
{
    verifyrow1column1ClientName(locator, clientname)
    {
        cy.get(locator)
          .should('exist')
          .and('not.be.disabled')
          .then((txt)=>{
            expect(txt.text().trim()).to.equal(clientname)
          })
          
    }
    verifyrow1column2Service(locator, servicename)
    {
        cy.get(locator)
        .should('exist')
        .then((txt)=>{
            expect(txt.text().trim()).to.equal(servicename)
        })
    }
    verifyrow1column3BrandStrategist(locator, initial, brandstrategist)
    {

        cy.get(locator)
          .should('exist')
          .then(()=>{
            cy.get(' > td:nth-child(3) > div > span')  //account specialist name
            .should('exist')
            .and('have.text', brandstrategist)
            cy.get(' > td:nth-child(3) > div > div > div > span')  //the initial logo
            .should('exist')
            .and('have.text', initial)
            .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
            .and('have.css', 'background-color', 'rgb(24, 121, 216)')  //background color
            .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
        })
    }
    verifyrow1column4ContractSigned(locator, contractsignedDate)
    {
        cy.get(locator)
        .should('exist')
        .then((txt)=>{
            expect(txt.text().trim()).to.equal(contractsignedDate)
        })
    }
    verifyrow1column5SubmissionDate(locator, submissiondate)
    {
        cy.get(locator)
        .should('exist')
        .then((txt)=>{
            expect(txt.text().trim()).to.equal(submissiondate)
        })
    }
    verifyrow1column6Action(locator, enabled_disabled, name)
    {
        cy.get(locator).scrollIntoView()
          .should('exist')
          .and(enabled_disabled)
          .and('have.text', name)
          .and('have.css', 'font-weight', '700')                  //font bold
          .and('have.css', 'color','rgb(148, 148, 148)')          //text color
          .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
    }
}
export default fortermination;