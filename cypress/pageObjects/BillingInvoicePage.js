      /// <reference types="cypress" />

class invoicenumberpage
{
    verifyinvoicenumberastitle(csslocator, invoicenumber)
    {
        cy.get(csslocator)
          .should('exist')
          .and('be.visible')
          .and('have.css', 'font-weight', '700')  //font bold
          .then(invoicenumbertitle=>{
            expect(invoicenumbertitle.text()).to.contain(invoicenumber)
          })
    }
    verifyexpectedstatus(locator, expectedstatus)
    {
        cy.get(locator)
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(255, 255, 255)')            //color
        .and('have.css', 'background-color', 'rgb(59, 130, 246)')  //background color
        .and('have.css', 'border-radius', '6px')                   //the edge of the background color that serve as the button
        .and('have.css', 'width', '64.0625px')                     //width size of the background color
        .and('have.css', 'height', '24px')                         //height size of the background color
        .then(()=>{
          cy.get('div.px-8 > h5 > div > div.bg-blue-500 > span')
            .should('have.text', expectedstatus)
            .and('have.css', 'font-weight', '700')           // font bold
            .and('have.css', 'text-transform', 'uppercase')  // all caps displayed in web
        })
    }
    verifybuttonswithtooltiptext(buttonlocator, tooltiplocator, tooltiptext)
    {
        cy.get(buttonlocator)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .then(()=>{
                //hover the mouse pointer at the button
            cy.get(buttonlocator).realHover()
              .wait(3000)
                //verify if the tooltip popup
            cy.get(tooltiplocator)
              .should('exist')
                  //.and('be.visible')
              .and('contain', tooltiptext)
              .and('have.attr', 'class').and('include', 'show')
          })
        
    }
    verifyautocollectontext(locator, expectedtext, duedate)
    {
      cy.get('div.w-full > div.text-gray-600')
        .should('exist')
        .and('contain', 'This invoice will be automatically collected on')  //contain some text
        .then(()=>{
              //verify AUTO COLLECT ON
          cy.get(locator)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(16, 185, 129)')  //text color
            .and('have.css', 'font-weight', '700')          //font bold
            .invoke('text')
            .then((ele)=>{
              expect(ele.text().replace(/\s+/g, ' ').trim()).to.equal(expectedtext)
          })
              //verify due date
          cy.get('div.w-full > div.text-gray-600 > b.text-green-500')
            .should('exist')
            .and('be.visible')
          .and('have.text', duedate)                      // day month year
          .and('have.css', 'color', 'rgb(16, 185, 129)')  //text color
          .and('have.css', 'font-weight', '700')          //font bold
                                                          //verify stop auto collect button
          cy.get('div.w-full > button.px-0 > img')
            .should('exist')
            .and('be.visible')
            .then(()=>{
                  //hover
              cy.get('div.w-full > button.px-0 > img').realHover().wait(2000)
                cy.get('div.w-full > button.px-0 > div')
                  .should('exist')
                  .and('not.be.disabled')
                  .and('contain', 'Stop auto collect')
                  .and('have.attr', 'class').and('include', 'show')
            })
        })

      
    }
    
    
}
export default invoicenumberpage;