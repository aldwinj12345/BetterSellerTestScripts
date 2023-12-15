/// <reference types="cypress" />

class AddTaskManagements
{
    AddOnboardingTask(taskName, taskDescription, addtaskbuttonselector, alertsuccessmodalselector, alertmessageselector, checklogoselector){

        //Click the Task Add button
        cy.click_link_button(addtaskbuttonselector)
          .wait(2000)

        //Now Enter Task Name
        cy.get('.p-4 > .grid > :nth-child(1) > .form-input')
          .clear()
          .type(taskName)
          .wait(1000)
          .should('have.value', taskName)

        //Enter Task Description
        cy.get('.p-4 > .grid > :nth-child(2) > .form-input')
          .clear()
          .type(taskDescription)
          .wait(1000)
          .should('have.value', taskDescription)

        //Click the Check/Submit/Save button
        cy.click_link_button('form > div > div > div:nth-child(3) > button:nth-child(1)')
          .wait(3000)

        //verify success message popup
        cy.get(alertsuccessmodalselector)
          .should('exist')
          .then(()=>{
            //verify the message inside
            cy.get(alertmessageselector)
              .should('exist')
              .and('have.text', 'Template has been created.')
              .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
              .and('have.css', 'font-weight', '400')  //font bold
            //verify check mark logo
            cy.get(checklogoselector)
              .should('exist')
              .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
        // I will close the Termination Request modal by pressing the esc key
        cy.get('body').type('{esc}'); // pressing esc button of the keyboard
        cy.wait(3000)
    }
    AddSIOperationsTask(){
      
    }
}
export default AddTaskManagements;