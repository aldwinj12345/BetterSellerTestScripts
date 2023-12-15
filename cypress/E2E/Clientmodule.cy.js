/// <reference types="cypress" />

import utilityfunctions from "../pageObjects/utilityfunctions.js"
import invoicenumberpage from "../pageObjects/BillingInvoicePage.js"
import upsellstablelist from "../pageObjects/client_billing_upsells_tablelist.js"
import billingupsells from "../pageObjects/billing_upsells.js"
import additionalservices from "../pageObjects/clientpartner_Invoices_additionalservicesTablelist.js"
import fortermination from "../pageObjects/ForTerminationTable.js"
import TaskManagementTablelist from "../pageObjects/AdminTaskManagementTablelist.js"
import AddTaskManagements from "../pageObjects/AddTaskAtTaskManagement.js"

import 'cypress-file-upload'
import "cypress-real-events/support";


let clientmoduledata;
let billingmoduledata;
let loginmoduledata;
let BSmodulesnavlink;
let useraccountdata;
let clientmodules;
let alertmessageslocators;
let accountprofilesettingslocator;
let clientratingdashboard;
let clientcomplaints;
let billingmodule;
let clientpartnerpage;
let adminmodule;
let linktextfolders;

let clienturlforpagination = ""; // the purpose of this is only for the table pagination searching for client name

before('This would call files that are at the fixtures', ()=>{

    //initiating LinktextFolders.json
    cy.fixture('LinktextFolders').then((data)=>{
      linktextfolders = data;
    })
  
    //initiating ClientModuleData.json
    cy.fixture('ClientModuleData').then((data)=>{
      clientmoduledata = data;
    })

    //initiating BillingModuleData.json
    cy.fixture('BillingModuleData').then((data)=>{
      billingmoduledata= data;
    })

    //inititating LoginModuleData.json
    cy.fixture('LoginModuleData').then((data)=>{
      loginmoduledata = data;
    })

    //initiating adminmodulelocatorsjson
    cy.fixture('adminmodulelocators').then((data)=>{
      adminmodule = data;
    })
  
    //initiating clientpartnerpagejson
    cy.fixture('clientpartnerpage').then((data)=>{
      clientpartnerpage = data;
    })    

    //initiating user accounts data
    cy.fixture('useraccounts').then((data)=>{
        useraccountdata = data;
    })

    //initiating the clientnavlinksmodules
    cy.fixture('BSnavlinksmodules').then((data)=>{
      BSmodulesnavlink = data;
    })
    
    //initiating the clientmodulelocators
    cy.fixture('clientmodulelocators').then((data)=>{
      clientmodules = data;
    })

    //initiating account profile settings json file
    cy.fixture('accountprofilesettings').then((data)=>{
      accountprofilesettingslocator = data;
    })

    //initiating alert messages
    cy.fixture('alertmessages').then((data)=>{
        alertmessageslocators = data;
    })

    //initiating clientratingdashboardlocators json file
    cy.fixture('clientratingdashboardlocators').then((data)=>{
      clientratingdashboard = data;
    })

    //initiating clientcomplaintslocators json file
    cy.fixture('clientcomplaintslocators').then((data)=>{
      clientcomplaints = data;
    })

    //initiating billingmodulelocators json file
    cy.fixture('billingmodulelocators').then((data)=>{
      billingmodule = data;
    })
})

beforeEach('Launch BS Login Page', ()=>{

  cy.visit(clientmoduledata.testData[0].testURL)
  cy.wait(3000)

    //change the window size of the browser
  cy.viewport(1600, 1100)
    //assert url - when launched sucessfully
  cy.url().should('contain','/sign-in')
  .and('contain','/sign-in')
})

//This function is only for searching a recently terminated client by searching its name in the Client > Inactive Clients > table on each page(s)
function searchNameInTable(name) {
  let isNameFound = false;
  const utilfunc = new utilityfunctions();
  function searchInCurrentPage() {
        let found = false;
        //const expectedText = 'alpaka';
        
        cy.get('table > tbody').within(() => {
          cy.get('tr').each(($row, rowIndex) => {
            if (!found) {
              cy.wrap($row)
                .find('td:first-child') // Select the first column <td> in each row
                .invoke('text')
                .then((columnText) => {
                  // Perform your assertions on `columnText` here
                  if (columnText.trim() === name) {
                    cy.log(`Client Name isFound -> ${columnText} in row -> ${rowIndex}`)
                    // then proceed on asserting the 7th column > Terminated At date
                    cy.get('td:nth-child(7) > div > span')
                      .should('exist')
                      .and('contain', utilfunc.getFormattedDateDayMonthyear())
                    cy.get('td:nth-child(7) > div > svg') // at the side of the terminated date there is pen icon for edit
                      .should('exist')
                      .and('not.be.disabled')
                    //verify at column 8 > Terminated Reason
                    cy.get('table > tbody > tr:nth-child('+rowIndex+') > td:nth-child(8)')
                      .should('exist')
                      .and('contain', 'Design Issues')
                    found = true; // Set the flag to true if the text is found
                    cy.wrap(false).as('breakLoop'); // Use cy.wrap() to break the loop
                  }
                });
            }
          });
        });

  }

  function goToNextPage() {
    cy.get('div[aria-label="Pagination"] > button:nth-child(3)').click(); // Replace 'next-page-selector' with the selector for the 'next page' button
  }

  cy.get('table > tbody > tr') // Replace 'table-selector' with your table's CSS selector
    .then(() => {
      cy.log('Table found'); // Log to confirm table detection
      
      searchInCurrentPage();

      function nextPageExists() {
        return !isNameFound && Cypress.$('div[aria-label="Pagination"] > button:nth-child(3):not([disabled])').length > 0;
      }

      function iterateThroughPages() {
        if (nextPageExists()) {
          cy.log('Navigating to next page'); // Log navigation to next page
          goToNextPage();
          cy.get('table > tbody > tr').then(($newTable) => {
            searchInCurrentPage($newTable);
            if (!isNameFound) {
              iterateThroughPages();
            }
          });
        }
      }

      iterateThroughPages();
    });
}

//The test cases are based on the Jira Confluence 
describe('Client Module Test Suite', () => {

  //calling utility functions
  const utilfunc = new utilityfunctions();
  //calling client_billing_upsells_tablelist
  const tablelist = new upsellstablelist();
  //calling billing_upsells
  const billingUpsells = new billingupsells();
  //calling additionalservices
  const additionalservicestablelist = new additionalservices();
  //calling ForTermination
  const terminationTablelist = new fortermination();

  it('Testcase ID: CP0001 - Verify when user click onto the client name, it will redirect to the client profile page', () => {
        
    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //Since when a user login, the first module that will automatically goes to is Workspace
    //I will verify first the client navigation module
    cy.get(BSmodulesnavlink.clientsnavlink)
      .should('exist')
      .and('not.be.disabled')
      .and('have.text', 'Clients')
      .and('have.css', 'color', 'rgb(255, 255, 255)') //default text color before i click it
      
    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .realHover() //Then I will hover my mouse, so expectedly there is a white background color
      .wait(600)
      .click()
      .and('have.css', 'color', 'rgb(239, 68, 68)') //changes text color into red
      .and('have.css', 'background-color', 'rgb(255, 255, 255)') //there is going to be a white background color
      .wait(2000)

    //verify expected destination to Active Client folder page
    cy.url().should('contain', '/clients/active')

    //verify the header page title
    cy.get(clientmoduledata.cssSelectors[0].ActiveClientHeaderTitle)
      .should('exist')
      .and('have.text', 'Active Clients')
      .and('have.css', 'font-weight', '700') //font bold
      .and('have.css', 'font-size', '25px')

    //Now in here I am just going to click the row 1 on the list regardless of what it is
    //before clicking, I will get the client name first for assertion
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .should('exist')
      .then($element => {
        // Get the href attribute
        const href = $element.attr('href');
        // Get the text content
        const text = $element.text();
        //I will click the client name link text
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .click()
          .wait(2000)
        //assert that the client name is also the header page title
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle)
          .should('exist')
          .and('have.text', text)
          .and('have.css', 'font-weight', '700') //font bold
          .and('have.css', 'font-size', '30px')
        //assert url expected destination
        cy.url().should('contain', href) 
      })
  })
  it('Testcase ID: CP0002 - Verify user can upload profile pic to a particular client', ()=>{

   
    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .click()
      .wait(3000)

    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)

    //verify there is upload section under the Client Dashboard > Profile > Overview
    cy.get(clientmoduledata.cssSelectors[0].profilePhotoSection)
      .should('exist')
      .then(()=>{
        //hover first
        cy.get(clientmoduledata.cssSelectors[0].profilePhotoSection).realHover('mouse')
        //verify if there is already an image uploaded previously or none
        cy.get(clientmoduledata.cssSelectors[0].profilePhotoInputfile).attachFile('sampMalePic.jpg')
          .wait(2000)
      })
      
    //verify alert-success message popup
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Profile picture uploaded')
    cy.getMessagepopup(alertmessageslocators.updatemessage, 'Profile logo successfully fetched.')

    //verify if the uploaded image appears in the upload photo section
    // what i did in here is i am using 2 photo over and over again so i have to verify if what photo i uploaded above then verify 
    //their width and height 
    //verify if there is image uploaded in the DOM 
    cy.get(clientmoduledata.cssSelectors[0].profileImageSource).should('exist')
      .then(()=>{
        //since there is, then I check if what was that image whether it is 'azoginsuit.jpg' or 'sampMalePic.jpg'
        cy.get(clientmoduledata.cssSelectors[0].profileImageSource)
          .invoke('attr', 'src')
          .then((src) => {
            // Check if the src attribute contains 'azoginsuit.jpg'
            if (src && src.includes('azoginsuit.jpg')) {
              // If it contains 'a1.jpg', assert width and height
              cy.get(clientmoduledata.cssSelectors[0].profileImageSource)
                .should('have.css', 'width', '111.296875px')
                .and('have.css', 'height', '99.84375px')
            } else {
              // Otherwise, the uploaded photo is sampMalePic.jpg, then assert width and height
              cy.get(clientmoduledata.cssSelectors[0].profileImageSource)
                .should('have.css', 'width', '111.296875px')
                .and('have.css', 'height', '134.390625px')
            }
          })
      })  
  })
  // **** EDIT PROFILE TESTING STARTS HERE *** 
  it('Testcase ID: CP0003 - Verify user can Edit profile Client Name in the list and in the Client name head title page', () => {
    
  
    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .click()
      .wait(3000)

    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)
 
    //////// Client Dashboard > Profile > Kebab Menu STARTS HERE ///////////////
    //verify if there is a kebab menu or 3 dots button under the profile sub tab and under the division of overview and it is visible and clickable
    cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
      .should('be.visible')
      .and('exist')
      .and('not.be.disabled')
      .then(()=>{
        cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
          .click()
          .wait(1000)
          .should('have.attr', 'aria-expanded', 'true') //after it was click it means the sub menu elements are visible
        //verify when the kebab button menu is click, there should be sub menu buttons such as Edit Profile | Update Password | Update Default Contact
        //Edit Profile
        cy.get(clientmoduledata.cssSelectors[0].kebabMenu_EditProfile)
          .should('exist')
          .and('have.text', 'Edit Profile')
          .and('not.be.disabled')
          .and('have.css', 'color', 'rgb(75, 85, 99)') //default text color
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //Update Password
        cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdatePassword)
          .should('exist')
          .and('have.text', 'Update Password')
          .and('not.be.disabled')
          .and('have.css', 'color', 'rgb(75, 85, 99)') //default text color
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //Update Default Contact
        cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdateDefaultContact)
          .should('exist')
          .and('have.text', 'Update Default Contact')
          .and('not.be.disabled')
          .and('have.css', 'color', 'rgb(75, 85, 99)') //default text color
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
      })
    //////// Client Dashboard > Profile > Kebab Menu ENDS HERE ///////////////
    
    //////// EDIT PROFILE PAGE STARTS HERE //////////
    //hover and then click the Edit Profile
    cy.get(clientmoduledata.cssSelectors[0].kebabMenu_EditProfile)
      .trigger('mouseover')
      .click()
      .wait(1000)
      
    //verify that it goes to profile edit page - in this test i will only check that the url contains /edit
    cy.url().should('contain', '/edit')

    //verify the Client Name Label and its input field
    cy.get(clientmoduledata.cssSelectors[0].InsideEditProfilePage[0].clientNameInputfieldandLabel).scrollIntoView()
      .should('exist')
      .within(()=>{
        //assert client name label
        cy.get('label')
          .should('exist')
          .and('have.text', 'Client *')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
        //assert Client name input field
        cy.get('input[name="client"]')
          .should('exist')
          .and('have.value', currentclientname)
      })

    //Update Client Name
    cy.get('input[name="client"]')
      .clear()
      .type(clientmoduledata.testData[1].clientNameTestData)
      .wait(1000)
      .should('have.value', clientmoduledata.testData[1].clientNameTestData)

    //verify Update button Then if Found click
    cy.get(clientmoduledata.cssSelectors[0].InsideEditProfilePage[0].updateButton).scrollIntoView()
      .should('exist')
      .and('not.be.disabled')
      .and('have.css', 'color', 'rgb(255, 255, 255)')
      .and('have.css', 'background-color', 'rgb(185, 28, 28)')  //background color that form like a capsule
      .and('have.css', 'border-radius', '16px')   //the curve edge of the background color
      .click()
      .wait(3000)

    //verify alert-success message popup 
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Update Success')
    cy.getMessagepopup(alertmessageslocators.updatemessage, 'Agency Client details were successfully updated')

    //Since it was change, then it is expected that the client name title also changes
    cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle)
      .should('have.text', clientmoduledata.testData[1].clientNameTestData)

    //Then here verify in the table that it is also updated
    //Click the Active Clients link text folder
    cy.get(linktextfolders.CLIENTmodules[0].ActiveClients_linktextFolder)
      .should('exist')
      .click()
      .wait(1000)
    //At Row 1 the editted client name
    cy.get('table > tbody > tr:first-child > td > a')
      .should('have.text', clientmoduledata.testData[1].clientNameTestData)

    /*const clientnameText1 = "(AAAROO) TEST A";
    const clientnameText2 = "(AAA)ROO TEST B";

    //get the current client name then compare on above
    cy.get(clientmoduledata.cssSelectors[0].InsideEditProfilePage[0].clientNameInputfieldandLabel)
      .find('input[name="client"]')
      .invoke('val')
      .then((clientnamevalue)=>{
        //here I will going to validate first what is the current name whether it is clientnameText1 or clientnameText2 then change/edit the opposite to the current
        utilfunc.EditClientName(clientnamevalue, clientnameText1, clientnameText2, clientmoduledata.cssSelectors[0].InsideEditProfilePage[0].updateButton, alertmessageslocators.updatesuccessmessagepopup, alertmessageslocators.updatemessage, clientmoduledata.cssSelectors[0].clientNameHeaderTitle, linktextfolders.CLIENTmodules[0].ActiveClients_linktextFolder)
      }) */
    //////// EDIT PROFILE PAGE ENDSS HERE //////////
  })
  // **** EDIT PROFILE TESTING ENDS HERE *** 
  // **** UPDATE CLIENT PASSWORD STARTS HERE *** 
  it('Testcase ID: CP0004 - Verify user when attempting to update client password without entering new password', ()=>{

    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .click()
      .wait(3000)

    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)

    //click the kebab menu or the 3 dots
    cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
      .should('exist')
      .click()
      .wait(1000)

    //hover and then click the Update Password
    cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdatePassword)
      .trigger('mouseover')
      .click()
      .wait(1000)
  
    //verify that the update default contact password modal popup open
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].modal)
      .should('exist')

    ///////// UPDATE DEFAULT CONTACT PASSWORD MODAL ASSERTION ELEMENTS STARTS HERE //////////
    //verify modal title - Update Default Contact Password
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].modaltitle)
      .should('exist')
      .should("have.css", "font-weight", "700")  // font bold
      .and('have.text', 'Update Default Contact Password')

    //verify "*New* Password input field and label"
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].NewPasswordLabelandInputfield)
      .should('exist')
      .within(()=>{
        //assert New Password Label
        cy.get('label')
          .should('exist')
          .and('have.text', '*New* Password')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        //assert input field
        cy.get('input[name="newPassword"]')
          .should('exist')
          .and('not.be.disabled')
          .and('have.value', '') //empty by default
          .and('have.attr', 'placeholder', 'Enter minimum of 8 characters')
      })

    //verify Confirm new password label and input field
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ConfirmNewPasswordLabelandInputfield)
      .should('exist')
      .within(()=>{
        //assert label
        cy.get('label')
          .should('exist')
          .and('have.text', 'Confirm *New* Password')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        //assert input field
        cy.get('input[name="confirmPassword"]')
          .should('exist')
          .and('not.be.disabled')
          .and('have.value', '') //empty by default
          .and('have.attr', 'placeholder', 're-type new password')
      })
    
    //verify cancel button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].CancelButton)
      .should('exist')
      .and('not.be.disabled')
      .and("have.css", "color", "rgb(239, 68, 68)")  //text color red
      .and("have.css", "font-weight", "700")         // font bold
      .and('have.text', 'Cancel')
  
    //verify Reset button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ResetButton)
      .should('exist')
      .and('not.be.disabled')
      .and("have.css", "font-weight", "700")                    // verify if it is in bold font
      .and("have.css", "color", "rgb(255, 255, 255)")           //text color 
      .and('have.css', 'background-color', 'rgb(185, 28, 28)')  //button color is red
      .and('have.css', 'border-radius', '16px')                 //button edge curve
      .and('have.text', 'Reset')
      
    //Without Enter new data password, just click the Reset button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ResetButton)
      .click()
      .wait(3000)

    //verify that the modal remains open
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].modal)
      .should('exist')

    //verify Error Text - Required - under the new Password
    cy.get('form > div > div:nth-child(1) > div')
      .should('exist')
      .and('have.text', 'Required')
      .and('have.css', 'color', 'rgb(185, 28, 28)') //text color
    
    //verify Error Text - Required - under the Confirm Unew Password
    cy.get('form > div > div:nth-child(2) > div')
      .should('exist')
      .and('have.text', 'Required')
      .and('have.css', 'color', 'rgb(185, 28, 28)') //text color
  })
  it('Testcase ID: CP0005 - Verify user when attempting to update client password and the new password is less than the minimum required characters.', ()=>{

    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .click()
      .wait(3000)

    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)

    //click the kebab menu or the 3 dots
    cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
      .should('exist')
      .click()
      .wait(1000)

    //hover and then click the Update Password
    cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdatePassword)
      .trigger('mouseover')
      .click()
      .wait(1000)
    
    //Enter New Password but only 7 characters
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].NewPasswordLabelandInputfield)
      .find('input[name="newPassword"]')
      .clear()
      .type(clientmoduledata.testData[2].newPasswordTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[2].newPasswordTestData)

    //Enter Confirm New Password the same data
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ConfirmNewPasswordLabelandInputfield)
      .find('input[name="confirmPassword"]')
      .clear()
      .type(clientmoduledata.testData[2].newPasswordTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[2].newPasswordTestData)

    //click the Reset button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ResetButton)
      .click()
      .wait(3000)

    //verify that the modal remains open
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].modal)
      .should('exist')

    //verify Error Text - Required - under the new Password
    cy.get('form > div > div:nth-child(1) > div')
      .should('exist')
      .and('have.text', 'Password must be at least 8 characters')
      .and('have.css', 'color', 'rgb(185, 28, 28)') //text color
  })
  it('Testcase ID: CP0006 - Verify user when attempting to update client password but the new password and the confirm new password does not match', () => {
        
    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .click()
      .wait(3000)
 
    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)
 
    //click the kebab menu or the 3 dots
    cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
      .should('exist')
      .click()
      .wait(1000)
 
    //hover and then click the Update Password
    cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdatePassword)
      .trigger('mouseover')
      .click()
      .wait(1000)

    //Enter New Password 
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].NewPasswordLabelandInputfield)
      .find('input[name="newPassword"]')
      .clear()
      .type(clientmoduledata.testData[3].newPasswordTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[3].newPasswordTestData)
   
    //Enter Confirm New Password But make sure it does not match with the new password
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ConfirmNewPasswordLabelandInputfield)
      .find('input[name="confirmPassword"]')
      .clear()
      .type(clientmoduledata.testData[3].confirmnewPasswordTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[3].confirmnewPasswordTestData)
    
    //click the Reset button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ResetButton)
      .click()
      .wait(3000)

    //verify that the modal remains open
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].modal)
      .should('exist')

    //verify Error Text - Required - under the new Password
    cy.get('form > div > div:nth-child(2) > div')
      .should('exist')
      .and('have.text', 'Passwords do not match')
      .and('have.css', 'color', 'rgb(185, 28, 28)') //text color  
  })
  it('Testcase ID: CP0007 - Verify user can update the client new password', () => {
    
    let GETcurentEmailAddress;
    let clientEmailAddress;

    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.get(BSmodulesnavlink.clientsnavlink)
      .click()
      .wait(3000)
 
    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)
    
    //GET the current client Email Address
    GETcurentEmailAddress = new Promise((resolve)=>{
      cy.get(clientmoduledata.cssSelectors[0].OverviewClientEmailAddress)
        .then((txt)=>{
          clientEmailAddress = txt.text().trim();
          resolve();
        })
    })
    
    //click the kebab menu or the 3 dots
    cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
      .should('exist')
      .click()
      .wait(1000)
 
    //hover and then click the Update Password
    cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdatePassword)
      .trigger('mouseover')
      .click()
      .wait(1000)

    //Enter New Password 
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].NewPasswordLabelandInputfield)
      .find('input[name="newPassword"]')
      .clear()
      .type(clientmoduledata.testData[4].newPasswordTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[4].newPasswordTestData)
   
    //Enter Confirm New Password But make sure it does not match with the new password
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ConfirmNewPasswordLabelandInputfield)
      .find('input[name="confirmPassword"]')
      .clear()
      .type(clientmoduledata.testData[4].confirmnewPasswordTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[4].confirmnewPasswordTestData)
    
    //click the Reset button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].ResetButton)
      .click()
      .wait(3000)

    //verify that the modal should close open
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactPasswordModal[0].modal)
      .should('not.exist')

    //verify alert-success notification message popup
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Successfully updated password')
    
    //just to make sure the alert-success message close
    cy.wait(8000)

    //Execute Logout
    //click the user account profile 
    cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
      .click()

    //click the sign out link text
    cy.get(accountprofilesettingslocator.signoutlinktext)
      .click()
      .wait(1000)

    ///// LOGIN ASSERTIONS USNG OLD AND NEW PASSWORD STARTS HERE //////////// 
    //Login using the account of the client with the previous password 
    cy.get('div > form.space-y-6').then(()=>{
      GETcurentEmailAddress.then(()=>{
        cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, clientEmailAddress, 'q@testing1')
          .wait(3000)
      })
    })
  
    //verify there is popup message 
    cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Authentication Error')
    cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Incorrect email or password')
   
    //verify it remains in the sign-in page as it should be 
    cy.url().should('contain','/sign-in')

    //login again but this time use the new password
    cy.get('div > form.space-y-6').then(()=>{
      GETcurentEmailAddress.then(()=>{
        cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, clientEmailAddress, clientmoduledata.testData[4].newPasswordTestData)
          .wait(5000)
      })
    })

    //verify it is successful and it goes to plan page
    cy.url().should('contain', '/plan')
  })
  it("Testcase ID: CP0008 - Verify user can update default contact", ()=>{

    //login using account specialist
    cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

    //click the Client module nav link
    cy.click()(BSmodulesnavlink.clientsnavlink)
      .wait(3000)
 
    //click the row 1 test in the active client 
    cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
      .click()
      .wait(2000)

    //click the kebab menu or the 3 dots
    cy.get(clientmoduledata.cssSelectors[0].kebabMenubutton)
      .should('exist')
      .click()
      .wait(1000)

    //hover and then click the Update Default Contact
    cy.get(clientmoduledata.cssSelectors[0].kebabMenu_UpdateDefaultContact)
      .trigger('mouseover')
      .click()
      .wait(1000)

    //verify the Update Default Contact modal popup
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].modal)
      .should('exist')

    ///////// UPDATE DEFAULT CONTACT MODAL ELEMENTS ASSERTIONS STARTS HERE /////////

    //verify modal title
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].modaltitle)
      .should('exist')
      .should("have.css", "font-weight", "700")  // font bold
      .and('have.text', 'Update Default Contact Details')

    //verify First Name Label and Input field
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].FirstNameLabelandInputfield)
      .should('exist')
      .within(()=>{
        //assert label
        cy.get('label')
          .should('exist')
          .and('have.text', 'First name')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        //assert input field
        cy.get("input[name='firstName']")
          .should('exist')
          .and('not.be.disabled')
      })

    //verify Last name Label and Input field
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].LastNameLabelandInputfield)
      .should('exist')
      .within(()=>{
        //assert label
        cy.get('label')
          .should('exist')
          .and('have.text', 'Last name')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        //assert input field
        cy.get("input[name='lastName']")
          .should('exist')
          .and('not.be.disabled')
      })

    //verify Email Label and Input field
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].EmailLabelandInputfield)
      .should('exist')
      .within(()=>{
        //assert label
        cy.get('label')
          .should('exist')
          .and('have.text', 'Email')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        //assert input field
        cy.get("input[name='email']")
          .should('exist')
          .and('not.be.disabled')
      })

    //verify cancel button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].CancelButton)
      .should('exist')
      .and('not.be.disabled')
      .and("have.css", "color", "rgb(239, 68, 68)")  //text color red
      .and("have.css", "font-weight", "700")         // font bold
      .and('have.text', 'Cancel')
  
    //verify Update button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].UpdateButton)
      .should('exist')
      .and('not.be.disabled')
      .and("have.css", "font-weight", "700")                    // verify if it is in bold font
      .and("have.css", "color", "rgb(255, 255, 255)")           //text color 
      .and('have.css', 'background-color', 'rgb(185, 28, 28)')  //button color is red
      .and('have.css', 'border-radius', '16px')                 //button edge curve
      .and('have.text', 'Update')

    //Enter First Name
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].FirstNameLabelandInputfield)
      .find("input[name='firstName']")
      .clear()
      .type(clientmoduledata.testData[5].FirsNameTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[5].FirsNameTestData)

    //Enter Last Name
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].LastNameLabelandInputfield)
      .find("input[name='lastName']")
      .clear()
      .type(clientmoduledata.testData[5].LastNameTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[5].LastNameTestData)

    //Enter Email Address
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].EmailLabelandInputfield)
      .find("input[name='email']")
      .clear()
      .type(clientmoduledata.testData[5].EmailAddressTestData)
      .wait(700)
      .should('have.value', clientmoduledata.testData[5].EmailAddressTestData)

    //Click the Update button
    cy.get(clientmoduledata.cssSelectors[0].UpdateDefaultContactDetailsModal[0].UpdateButton)
      .click(3000)

    //verify alert-success message popup
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Default contact updated')
    cy.getMessagepopup(alertmessageslocators.updatemessage, 'Successfully updated contact details')

    //verify under the Profile > Overview if the changes reflect
    //Contact Name
    cy.get(clientmoduledata.cssSelectors[0].OverivewContactName)
      .should('exist')
      .and('have.text', `${clientmoduledata.testData[5].FirsNameTestData} ${clientmoduledata.testData[5].LastNameTestData}`)

    //Client's Email Address
    cy.get(clientmoduledata.cssSelectors[0].OverviewClientEmailAddress)
      .should('exist')
      .and('have.text', clientmoduledata.testData[5].EmailAddressTestData)
  })
  // **** UPDATE CLIENT PASSWORD ENDS HERE ***
  // **** CLIENT DASHBOARD FILE STARTS HERE ***
  it.skip("Testcase ID: CDF0001 - Verify user can Upload file", ()=>{


          //calling utility functions
      const utilfunc = new utilityfunctions();
     
          //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)

          //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

          //At the stage, it is already accessed to Client Dashboard Tab
          //verify if under the Client Dashboard Tab there is a Files Tab
      cy.get(clientmodules.clientdashboardtab[3].filestablink)
        .should('exist')
        .and('be.visible')
        .and('have.text', ' Files')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(156, 163, 175)')  //font text color
        .then(($el) => {
          const computedStyle       = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      
          //click the Files tab
      cy.click_link_button(clientmodules.clientdashboardtab[3].filestablink)
        .wait(2000)
        /*
          //verify url destination
      cy.url().should('contain', '/files')

          //verify that the files tab font color to signify that is currently accessed, the color is red
      cy.get(clientmodules.clientdashboardtab[3].filestablink)
        .should('have.css', 'color', 'rgb(239, 68, 68)')  //font text color
      
          //verify files tab main title page
      cy.get(clientmodules.clientdashboardtab[3].filestabmaintitle)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Uploaded Files')
        .and('have.css', 'font-weight', '700')  // font bold

          //verify there is the upload element section with label says Drop file or click to select
      cy.get('div.file-drop-target > div')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .then(()=>{ 
              //assert the label
          cy.get(clientmodules.clientdashboardtab[3].dropfileorclicktoselectuploadlabel)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Drop file or click to select')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
        })

          //verify the grid view mode button
      cy.get(clientmodules.clientdashboardtab[3].gridmodebutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(239, 68, 68)')  //color is red by default since when you first access the Files tab the grid_view mode is set

          //verify the list view mode button
      cy.get(clientmodules.clientdashboardtab[3].listmodebutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(0, 0, 0)')  //color is black
      
          //click the List view mode button
      cy.click_link_button(clientmodules.clientdashboardtab[3].listmodebutton)
        .wait(1000)

          //verify that the grid view color changes to black and the list view mode button is red
      cy.get(clientmodules.clientdashboardtab[3].gridmodebutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(0, 0, 0)')
      cy.get(clientmodules.clientdashboardtab[3].listmodebutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(239, 68, 68)')

          //click again the Grid view mode button
      cy.click_link_button(clientmodules.clientdashboardtab[3].gridmodebutton)
        .wait(1000)

          ///////////////// UPLOAD FILE ASSERTIONS STARTS HERE ////////////////////////`
          //upload a *jpeg file
      cy.get(clientmodules.clientdashboardtab[3].uploadafileuploadinput).attachFile('bol g.jpg')
        .wait(1000)
      
          //verify if Upload attachments appears after a successful partial upload of a file from the local drive
      cy.get(clientmodules.clientdashboardtab[3].uploadattachmentsbutton)
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //font color
        .and('have.css', 'background-color', 'rgb(5, 150, 105)') //background color that shape like a capsule
        .and('have.css', 'border-radius', '6px') // the corner edge of the button
        .and('have.css', 'width', '153.375px')
        .and('have.css', 'height', '38px')
        .and('have.text', 'Upload Attachments')

      //click the Upload Attachments button
      cy.click_link_button(clientmodules.clientdashboardtab[3].uploadattachmentsbutton)
        .wait(2000)

      
          //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'File uploaded')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'AgencyClient Attachment has been successfully uploaded and created.')
        

          //verify if the uploaded image is at row 1, exist in DOM and visible in page
      cy.get('div.gap-x-6 > div.grid > div').should('exist').then(()=>{
          //verify image 
        cy.get('div.mb-5 > div.bg-gray-200 > img')
          .should('exist')
          .and('be.visible')
          .and('have.css', 'width', '162.1875px') //expected weight size displayed
          .and('have.css', 'height', '104.59375px') //expected height size displayed
          //verify the initial of the the uploader - account specialist
        cy.get('div.mb-5 > span.bg-green-text')
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(255, 255, 255)') //text color of the initial
          .and('have.css', 'background-color', 'rgb(94, 169, 98)') // background green circle color of the initial
          .and('have.css', 'border-radius', '24px') //expected shape of the background is circle
          .and('have.css', 'text-transform', 'uppercase') //the displayed initial is all caps
          .and('have.text', 'lm')
          //verify the filename of the uploaded image
        cy.get('div.col-span-1 > p.text-grayscale-900')
          .should('exist')
          .and('be.visible')
          .and('have.text', 'bol g.jpg')
          //verify date uploaded
        cy.get('div.col-span-1 > p.text-grayscale-600')
          .should('exist')
          .and('be.visible')
          .and('contains', utilfunc.getFormattedDateMonthDayyear) // the time is not included
      }) */
      cy.wait(2000)
      //hover onto the image itself
      cy.get('div.gap-x-6 > div.grid > div').realHover()
        .wait(1000)
        .then(()=>{
          //verify if edit, download, copy to clipboard, and delete buttons visibly appear
          cy.get('div.hidden > div.flex > div > button > svg').each(($button) => {
            cy.wrap($button)
              .should('exist')         // Assert that each buttons exists
              .and('be.visible')    // Assert that each button is visible
              .and('not.be.disabled');  // Assert that each button is not disabled
          })
        })
      //click the list view
      cy.click_link_button(clientmodules.clientdashboardtab[3].listmodebutton)
        .wait(2000)
      
      ///////////////// UPLOAD FILE ASSERTIONS ENDS HERE ////////////////////////

  })
  it.skip("Testcase ID: CDF0002 - Verify user can Edit the filename of the uploaded file", ()=>{

      //calling utility functions
      const utilfunc = new utilityfunctions();
     
      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
 
      //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

      //click the Files tab
      cy.click_link_button(clientmodules.clientdashboardtab[3].filestablink)
        .wait(2000)

  })
  it.skip("Testcase ID: CDF0003 - Verify user can download of the uploaded file", ()=>{


      //calling utility functions
      const utilfunc = new utilityfunctions();
     
      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
      //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

      //click the Files tab
      cy.click_link_button(clientmodules.clientdashboardtab[3].filestablink)
        .wait(2000)

  })
  it.skip("Testcase ID: CDF0004 - Verify user can link copy into clipboard of the uploaded file", ()=>{


      //calling utility functions
      const utilfunc = new utilityfunctions();
     
      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
      //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

      //click the Files tab
      cy.click_link_button(clientmodules.clientdashboardtab[3].filestablink)
        .wait(2000)




  })
  it.skip("Testcase ID: CDF0005 - Verify user can delete the uploaded file ", ()=>{


      //calling utility functions
      const utilfunc = new utilityfunctions();
     
      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
      //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

      //click the Files tab
      cy.click_link_button(clientmodules.clientdashboardtab[3].filestablink)
        .wait(2000)





  })
  // **** CLIENT DASHBOARD FILE ENDS HERE ***
  // **** CLIENT UPSELL STARTS HERE ***
    it("Testcase ID: CCU0001 - Verify create upsell draft of a client that is connected to amazon or the Selling Partner API and Advertising API are enabled", ()=>{
        
      let currentclientname;
      let currentclientemailaddress;
        
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //select Dexy Paws test client specifically since it is the only test client that the Selling Partner API and Advertising API is enabled for amazon
      cy.get('a[href="/clients/71fa24a1-4bf5-47fa-9f2a-571471686bc0/dashboard"]')
        .click()
        .wait(2000)

      //GET current client name as the H1 title
      cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle)
        .then((textName)=>{
          currentclientname = textName.text().trim()
          cy.log(" THIS IS THE CURRENT CLIENT NAME "+currentclientname)
        })

      //GET the current client email address
      cy.get(clientmodules.clientdashboardtab[1].overviewclientinformation[0].clientsemailaddress)
        .then(cemail=>{
          currentclientemailaddress = cemail.text();
          cy.log(currentclientemailaddress)
        })
        
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)
        
      //Click the Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(1000)
        
      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ////SELECT UPSELL ITEM AND SAVE AS DRAFT STARTS HERE ////////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')
      
      //Click the Select Available ASIN/s to add button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SelectAvailableASINstoAddButton)
        .click()
        .wait(1000)

      //Select Available ASINS
      cy.get('button[value="B06XCYD65F"]')
        .click()
        .wait(1000)
      
      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .should('have.value', 'B06XCYD65F')

      //Click Save as Draft Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SaveasDraftButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      ////SELECT UPSELL ITEM AND SAVE AS DRAFT ENDS HERE ////////////////

      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION STARTS HERE /////////////

      //verify the column names first
      const expected_columnNames = [
        'Service',
        'Invoice',
        'Amount',
        'Status',
        'Date',
        'Submitted By',
        'Updated By',
        'Action'
    ];
    cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(190, 190, 190)')
        .then(($el) => {
          const computedStyle       = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
        cy.log(expected_columnNames[index]) 
    });

      //newly created upsell whether it is a draft or submitted will appear on top row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert Row 1 column 2 name Invoice
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert Row 1 column 3 name Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Row 1 column 4 name Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'draft', 'rgb(107, 114, 128)', 'rgb(243, 244, 246)')
        //assert Row 1 column 5 name Date
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())  //date created /submitted utilfunc.getFormattedDate()
        //assert Row 1 column 6 name Submitted By
        tablelist.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(7)', '—')
        //assert Row 1 column 8 name Action - has edit button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', ' Edit')
      }) 
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION ENDS HERE /////////////  
    })
    it("Testcase ID: CCU0002 - Create Upsell Draft for client that is not connected to Amazon Selling Partner", () => {
     
      let currentclientname;
      let currentclientemailaddress;
        
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)
        
      //GET current client name as the H1 title
      cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle)
        .then((textName)=>{
          currentclientname = textName.text().trim()
          cy.log(" THIS IS THE CURRENT CLIENT NAME "+currentclientname)
        })

      //GET the current client email address
      cy.get(clientmoduledata.cssSelectors[0].OverviewClientEmailAddress)
        .then(cemail=>{
          currentclientemailaddress = cemail.text();
          cy.log(currentclientemailaddress)
        })
        
      //Verify then click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Billing')
        .and('have.css', 'color', 'rgb(107, 114, 128)') //default text color before it is click
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(220, 38, 38)') //changes the text color
        .and('have.css', 'font-weight', '700') // font bold

      //Verify and then click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', ' Upsells')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default text color before it is click
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') //changes the text color
        .and('have.css', 'font-weight', '600') // font bold

      //verify the Upsells title 'Upsells'
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTitle)
        .should('exist')
        .and('have.text', 'Upsells')
        .and('have.css', 'font-weight', '700') // font bold

      //verify Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', ' Create Upsell')
        .and("have.css", "font-weight", "700")                //bold font
        .and("have.css", "color", "rgb(30, 58, 138)")         //color text is resolution blue
        .and("have.css", "border-color", "rgb(30, 58, 138)")  //border-color text is resolution blue
        .and("have.css", "border-radius", "9999px")           //verify if the border-radius size
        .click()
        .wait(1000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL MODAL ASSERTIONS ELEMENTS STARTS HERE //////////////
      
      //verify modal title
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'create Upsell')
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.css', 'text-transform', 'capitalize')

      //verify Upsell Item label and its select drop down menu
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .should('exist')
        .within(()=>{
          //assert Upsell Item label
          cy.get('label')
            .should('exist')
            .and('have.text','Upsell Item*')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert Upsell Item Select Drop down menu
          cy.get('select')
            .should('exist')
            .and('not.be.disabled')
            .find('option').should('have.length.gt', 0) //since the list is not static, and can be add/delete/edit upsell items so the assertion is just to make sure that there is at least minimum of 1
        })

      //verify Quantity label and its input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].QuantitylabelAndInputfield)
        .should('exist')
        .within(()=>{
          //assert Quantity label
          cy.get('label')
            .should('exist')
            .and('have.text','Quantity*')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert Quantity input field
          cy.get('input')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '1')
        })

      //verify Unit Price label and its input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .should('exist')
        .within(()=>{
          //assert Unit Price label
          cy.get('label')
            .should('exist')
            .and('have.text','Unit Price*')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert Unit Price input field
          cy.get('.relative > input')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '0')
          //assert the dollar symbol in the input field
          cy.get('.relative > span')
            .should('exist')
            .and('have.text','$')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
        })

      //verify Waive Upsell Fee labela and slide button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].WaiveUpsellFeelabelAndSlidebutton)
        .should('exist')
        .within(()=>{
          //assert Waive Upsell Fee label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Waive Upsell Fee')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
          //assert Slide button
          cy.get('button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'aria-checked', 'false') //by default it is OFF
            .and('have.css', 'background-color', 'rgb(229, 231, 235)') // background color
            .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        })
      
      //verify Upsell Description label and its textarea
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .should('exist')
        .within(()=>{
          //assert Upsell Description label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Upsell Description*')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert Upsell Description textarea
          cy.get('textarea')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Add information related to this upsell')
        })

      //verify SERVICE ASIN
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ServiceASINTitle)
        .should('exist')
        .and('contain','Service ASIN')
        .and('have.css','font-weight', '700')  //font bold
        .then(($el) => {
          const computedStyle       = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      
      //verify ASIN 1* default label and its input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ASIN1defaultLabelandInputfield)
        .should('exist')
        .then(()=>{
          //assert ASIN 1* label
          cy.get('form > div.text-gray-800 > div > div > div > span')
            .should('exist')
            .and('have.css','font-weight', '700')  //font bold
            .then((ele)=>{
              expect(ele.text().replace(/\s+/g, ' ').trim()).to.equal('ASIN 1*')
              const computedStyle       = getComputedStyle(ele[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert ASIN 1* input field
          cy.get('input[name="serviceAsins.0.asin"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Enter ASIN') 
        })

      //verify Add Service ASIN button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].AddServiceAsinButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Add Service ASIN')
        .and('have.css','font-weight', '700')  //font bold
        .and("have.css", "color", "rgb(30, 58, 138)") //tezxt color
        .and('have.css', 'border-color', 'rgb(30, 58, 138)') //the outline that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve outline

      //verify Note textarea field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].NoteTextareafieldandLabel)
        .should('exist')
        .within(()=>{
          //assert Note Textarea field label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Note')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
          //assert Note textarea field
          cy.get('textarea')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'placeholder', 'Add any important information related to this upsell')
            .and('have.value', '')
        })

      //verify Save as Draft button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SaveasDraftButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Save as Draft')
        .and('have.css', 'color', 'rgb(59, 130, 246)')  //text color
        .and('have.css','font-weight', '700')  //font bold

      //verify Submit button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Submit')
        .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
        .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
        .and('have.css', 'border-radius', '9999px') //the curve edge of the background color

      ///////// CREATE UPSELL MODAL ASSERTIONS ELEMENTS ENDS HERE //////////////  

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Save as Draft Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SaveasDraftButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')
      ///////// CREATE UPSELL REQUEST ENDS HERE //////////////
      
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION STARTS HERE /////////////

      //verify the column names first
      const expected_columnNames = [
        'Service',
        'Invoice',
        'Amount',
        'Status',
        'Date',
        'Submitted By',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(190, 190, 190)')
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        cy.log(expected_columnNames[index]) 
      });

      //newly created upsell whether it is a draft or submitted will appear on top row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert Row 1 column 2 name Invoice
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert Row 1 column 3 name Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Row 1 column 4 name Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'draft', 'rgb(107, 114, 128)', 'rgb(243, 244, 246)')
        //assert Row 1 column 5 name Date
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())  //date created /submitted utilfunc.getFormattedDate()
        //assert Row 1 column 6 name Submitted By
        tablelist.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(7)', '—')
        //assert Row 1 column 8 name Action - has edit button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', ' Edit')
      }) 
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION ENDS HERE /////////////      
    })
    it("Testcase ID: CCU0003 - Edit the Created Draft Upsell", ()=>{

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //At the Upsell table select the draft upsell by clicking its Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(8) > button')
        .click()
        .wait(2000)

      //verify the Update Upsell modal popup
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')
        
      //Update the upsell item by selecting a different one
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('NB999SO')
        .should('have.value', 'NB999SO')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'New Balance 999')

      //verify the updated Unit price value
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '125')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Shoes. Outdoor')

      //Change the ASIN 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ASIN1defaultLabelandInputfield)
        .find('input[name="serviceAsins.0.asin"]')
        .clear()
        .type('asinOnenumber1')

      //Click the Save button - previously the name of this button is Save as Draft
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SaveasDraftButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Save')
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')

      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION STARTS HERE /////////////

      //verify the column names first
      const expected_columnNames = [
        'Service',
        'Invoice',
        'Amount',
        'Status',
        'Date',
        'Submitted By',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(190, 190, 190)')
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        cy.log(expected_columnNames[index]) 
      });

      //newly created upsell whether it is a draft or submitted will appear on top row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'New Balance 999')
        //assert Row 1 column 2 name Invoice
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert Row 1 column 3 name Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 125.00')
        //assert Row 1 column 4 name Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'draft', 'rgb(107, 114, 128)', 'rgb(243, 244, 246)')
        //assert Row 1 column 5 name Date
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())  //date created /submitted utilfunc.getFormattedDate()
        //assert Row 1 column 6 name Submitted By
        tablelist.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(7)', '—')
        //assert Row 1 column 8 name Action - has edit button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', ' Edit')
      }) 
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION ENDS HERE /////////////  

    })
    it("Testcase ID: CCU0004 - Submit the Draft Upsell ", ()=>{

      let GETRowData;
      let serviceName;
      let GETclientName;
      let clientName;
      let amountRequest;


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name
      GETclientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //FOR REFERENCE ASSERTIONS - I WILL GET THE DATA IN THE ROW TABLE FIRST
      GETRowData = new Promise((resolve)=>{
        //GET Column 1 Service Name / Upsell Request Name
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > button').then((col1)=>{
          serviceName = col1.text().trim();
        })
        //GET Column 3 Amount
        cy.get('table > tbody > tr:first-child > td:nth-child(3) > span').then((col3)=>{
          amountRequest = col3.text().replace(/\s+/g, ' ').trim();
        })
        resolve();
      })
      
      //At the Upsell table select the draft upsell by clicking its Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(8) > button')
        .click()
        .wait(2000)

      //verify the Update Upsell modal popup
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      //verify the Submit button then Click
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Submit')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') // background-color that form like a capsule button
        .and('have.css', 'border-radius', '9999px') //the curve edge of the background color
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.updatemessage, 'Upsell created') 

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
      
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION STARTS HERE /////////////

      //verify the column names first
      const expected_columnNames = [
        'Service',
        'Invoice',
        'Amount',
        'Status',
        'Date',
        'Submitted By',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(190, 190, 190)')
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
          cy.log(expected_columnNames[index]) 
      });
  
      //I will only assert the status that it should become Awaiting Approval and the Date updated or submitted in the Client > Billing > Upsell tab > Table list 
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 4 name Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Row 1 column 5 name Date
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())  
      }) 
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION ENDS HERE ///////////// 

      //logout as account specialist
      //click the user account profile 
      cy.click_link_button(accountprofilesettingslocator.useraccountprofilepicinitial)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)

      //As expected it goes right away to Awaiting Approval tab
      ////// BILLING > UPSELLS > TABLE LIST ASSERTIONS STARTS HERE ////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        cy.get(' > td:nth-child(1) > button').should('exist').then(()=>{
          GETRowData.then(()=>{
            billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', serviceName)
          })
        })
        //assert Row 1 column 2 name Client Name
        cy.get(' > td:nth-child(2) > a').should('exist').then(()=>{
          GETclientName.then(()=>{
            billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          }) 
        })  
        //assert Row 1 column 3 name Amount
        cy.get(' > td:nth-child(3) > span').should('exist').then(()=>{
          GETRowData.then(()=>{
            billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', amountRequest)
          })
        })
        //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
            //assert Row 1 column 7 name action = has Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')   
      })  
      ////// BILLING > UPSELLS > TABLE LIST ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CCU0005 - Create Upsell Request and submit", ()=>{
      
      let GETclientName;
      let clientName;
   
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name
      GETclientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
        
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
      ///////// CREATE UPSELL REQUEST ENDS HERE //////////////

      ////SELECT UPSELL ITEM AND SAVE SUBMIT ENDS HERE ////////////////  
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION STARTS HERE /////////////

          //verify the column names first
      const expected_columnNames = [
          'Service',
          'Invoice',
          'Amount',
          'Status',
          'Date',
          'Submitted By',
          'Updated By',
          'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(190, 190, 190)')
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
          cy.log(expected_columnNames[index]) 
      });

      //newly created upsell whether it is a draft or submitted will appear on top row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert Row 1 column 2 name Invoice
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert Row 1 column 3 name Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Row 1 column 4 name Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Row 1 column 5 name Date
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())  
        //assert Row 1 column 6 name Submitted By
        tablelist.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(7)', '—')
        //assert Row 1 column 8 name Action - has edit button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'be.disabled', 'View')
      }) 
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION ENDS HERE ///////////// 
          
      //logout as account specialist
      //click the user account profile 
      cy.click_link_button(accountprofilesettingslocator.useraccountprofilepicinitial)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)

      ////// BILLING > UPSELLS TABLE VERIFICATION STARTS HERE /////////////
  
      //verify the column names
      const expectedcolumnNames = [
        'Service',
        'Client Name',
        'Amount',
        'Status',
        'Date',
        'Submitted By',
        'Action'
      ];
      cy.get(billingmodule.Upsells[0].awaitingapprovaltab[0].columnNames).each(($option, index) => {
        cy.wrap($option).should('have.text', expectedcolumnNames[index])  //verify names based on the expected names per column
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(190, 190, 190)')
        .then(($el) => {
          const computedStyle       = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
          })
        cy.log(expectedcolumnNames[index]) 
      });

      //the recent submitted upsell request is at the row 1 as designed at the time this was created   
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert Row 1 column 2 name Client Name
        cy.get(' > td:nth-child(2) > a').should('exist').then(()=>{
          GETclientName.then(()=>{
            billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          }) 
        })  
        //assert Row 1 column 3 name Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name action = has Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')   
      })   
      ////// BILLING > UPSELLS TABLE VERIFICATION ENDS HERE /////////////     
    })
    it("Testcase ID: CCU0006 - Create upsell request choosing Paid Reviews item and submit", ()=>{
 
      let GETclientName;
      let clientName;
   
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name
      GETclientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
        
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')
        
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('REVIEWS')
        .wait(1000)
        .should('have.value', 'REVIEWS')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Paid Review Program')
        
      //verify there is Review Fee* Label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ReviewFeeLabelandInputfield)
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Review Fee*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert $ symbol 
          cy.get('div > span')
            .should('exist')
            .and('have.text', '$')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '600') //font bold
          //assert input field
          cy.get('div > input[name="details.reviewFee"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '25') //default value
        })

      //verify Processing Fee* label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ProcessingFeeLabelandInputfield)
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Processing Fee*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert % symbol 
          cy.get('div > span')
            .should('exist')
            .and('have.text', '%')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '600') //font bold
          //assert input field
          cy.get('div > input[name="details.processingFee"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '3') //default value
        })

      //verify Tax* label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].TaxLabelandInputfield)
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Tax*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert % symbol 
          cy.get('div > span')
            .should('exist')
            .and('have.text', '%')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '600') //font bold
          //assert input field
          cy.get('div > input[name="details.tax"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '6.8') //default value
        })

      //verify Estimate Completion Date* label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].EstimateCompletionDateLabelandInputfield)
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Estimate Completion Date*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert input field
          cy.get('input[name="details.completionDate"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'type', 'date')
        })

      //verify Upsell Description
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramUpsellItemDescriptionLabelandTextareafield)
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Upsell Description*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert input field
          cy.get('textarea[name="details.description"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', 'This invoice covers the Agency’s services for providing product reviews on Amazon. The reviews will be conducted for the ASINs listed on the billing summary.') //default value
        })

      //verify Quantity* Label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramQuantityLabelandInputfield)
        .scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Quantity*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert input field
          cy.get('input[name="serviceAsins.0.qty"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '1') //default value
        })

      //verify Unit Price Label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramUnitPriceLabelandInputfield)
        .should('exist')
        .and('not.be.disabled')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Unit Price*')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert $ symbol 
          cy.get('div > span')
            .should('exist')
            .and('have.text', '$')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '600') //font bold
          //assert input field
          cy.get('div > input[name="serviceAsins.0.price"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '0') //default value
        })

      //verify Total Product Cost Label and default value
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalProductCostLabelandDefaultValue)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Product Cost')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert $ 0.00
          cy.get('span')
            .should('exist')
            .then((txt)=>{
              const defaultText = txt.text().replace(/\s+/g, ' ').trim();
              expect(defaultText).to.contain('$ 0.00')
            })
        })

      //verify Total Review Fee Label and default value
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalReviewFeeLabelandDefaultValue)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Review Fee')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert $ 0.00
          cy.get('span')
            .should('exist')
            .then((txt)=>{
              const defaultText = txt.text().replace(/\s+/g, ' ').trim();
              expect(defaultText).to.contain('$ 25.00')
            })
        })

      //verify Total Processing Fee and default value
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalProcessingFeeLabelandDefaultValue)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Processing Fee')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert $ 0.00
          cy.get('span')
            .should('exist')
            .then((txt)=>{
              const defaultText = txt.text().replace(/\s+/g, ' ').trim();
              expect(defaultText).to.contain('$ 0.00')
            })
        })

      //verify Total Tax Label and default value
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalTaxLabelandDefaultValue)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Tax')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert $ 0.00
          cy.get('span')
            .should('exist')
            .then((txt)=>{
              const defaultText = txt.text().replace(/\s+/g, ' ').trim();
              expect(defaultText).to.contain('$ 0.00')
            })
        })

      //Now I will set date of Estimated Completion
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].EstimateCompletionDateLabelandInputfield)
        .scrollIntoView()
        .find('input[name="details.completionDate"]')
        .clear()
        .type(utilfunc.getFormattedDateYearMonthDayWithDash())
        .wait(1000)
        .should('have.value', utilfunc.getFormattedDateYearMonthDayWithDash())
      
      //Enter ASIN number
      cy.get("input[name='serviceAsins.0.asin']")
        .scrollIntoView()
        .clear()
        .type('asinNumber012')
        .wait(700)
        .should('have.value', 'asinNumber012')

      //Enter Quantity
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramQuantityLabelandInputfield)
        .find('input[name="serviceAsins.0.qty"]')
        .clear()
        .type('5')
        .wait(700)
        .should('have.value', '5')

      //Enter Unit Price
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramUnitPriceLabelandInputfield)
        .find('div > input[name="serviceAsins.0.price"]')
        .clear()
        .type('10')
        .wait(700)
        .should('have.value', '10')

      //verify the updated value of the Total Product Cost
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalProductCostLabelandDefaultValue)
        .find('span')
        .then((txt)=>{
          const defaultText = txt.text().replace(/\s+/g, ' ').trim();
          expect(defaultText).to.contain('$ 50.00')
        })
      
      //verify the updated value of the Total Processing Fee
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalProcessingFeeLabelandDefaultValue)
        .find('span')
        .then((txt)=>{
          const defaultText = txt.text().replace(/\s+/g, ' ').trim();
          expect(defaultText).to.contain('$ 1.50')
        })

      //verify the updated value of the Total Review Fee
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalReviewFeeLabelandDefaultValue)
        .find('span')
        .then((txt)=>{
          const defaultText = txt.text().replace(/\s+/g, ' ').trim();
          expect(defaultText).to.contain('$ 125.00')
        })

      //verify the updated value of the Total Tax
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].PaidReviewProgramTotalTaxLabelandDefaultValue)
        .find('span')
        .then((txt)=>{
          const defaultText = txt.text().replace(/\s+/g, ' ').trim();
          expect(defaultText).to.contain('$ 3.40')
        })
      
      //Click Submit button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)

      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION STARTS HERE ///////////// 
      //newly created upsell whether it is a draft or submitted will appear on top row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Paid Review Program')
        //assert Row 1 column 2 name Invoice
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert Row 1 column 3 name Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 179.90')
        //assert Row 1 column 4 name Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Row 1 column 5 name Date
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())  
        //assert Row 1 column 6 name Submitted By
        tablelist.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(7)', '—')
        //assert Row 1 column 8 name Action - has edit button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'be.disabled', 'View')
      }) 
      /////// CLIENT > BILLING > UPSELLS TAB > TABLE VERFICATION ENDS HERE /////////////  

      //logout as account specialist
      //click the user account profile 
      cy.click_link_button(accountprofilesettingslocator.useraccountprofilepicinitial)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)
      
      ////// BILLING > UPSELLS TABLE VERIFICATION STARTS HERE /////////////
      //verify the column names
      const expectedcolumnNames = [
        'Service',
        'Client Name',
        'Amount',
        'Status',
        'Date',
        'Submitted By',
        'Action'
      ];
      cy.get(billingmodule.Upsells[0].awaitingapprovaltab[0].columnNames).each(($option, index) => {
        cy.wrap($option).should('have.text', expectedcolumnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(190, 190, 190)')
          .then(($el) => {
            const computedStyle       = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
          cy.log(expectedcolumnNames[index]) 
      });

      //the recent submitted upsell request is at the row 1 as designed at the time this was created   
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 column 1 name Service
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Paid Review Program')
        //assert Row 1 column 2 name Client Name
        cy.get(' > td:nth-child(2) > a').should('exist').then(()=>{
          GETclientName.then(()=>{
            billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          }) 
        })  
        //assert Row 1 column 3 name Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 179.90')
        //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name action = has Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')
      })
      ////// BILLING > UPSELLS TABLE VERIFICATION ENDS HERE /////////////
    })
    it("Testcase ID: CCU0007 - Verify Different ASIN label based on the selected upsell item", ()=>{

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')
        
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('REVIEWS')
        .wait(1000)
        .should('have.value', 'REVIEWS')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Paid Review Program')

      //verify the managed asin label
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ServiceASINTitle)
        .should('exist')
        .and('contain', 'ASINs to review')
        .and('have.css', 'font-weight', '700')  //font bold
        
      //change selected upsell item - Walmart Listing Optimization
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('walmart-listing-optimization')
        .wait(1000)
        .should('have.value', 'walmart-listing-optimization')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'walmart listing optimization')

      //verify again the managed asin label
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].ServiceASINTitle)
        .should('exist')
        .and('be.visible')
        .and('contain', 'Service Items')
        .and('have.css', 'font-weight', '700')  //font bold

      //change selected upsell item - random - Copywriting Work
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .wait(1000)
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify again the managed asin label
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].managedasinlabel)
        .should('exist')
        .and('contain', 'Service ASIN')
        .and('have.css', 'font-weight', '700')  //font bold
    })
    it("Testcase ID: CCU0008 - Deny submitted upsell request", ()=>{

      let GETColumnsData;
      let serviceName;
      let clientName;
      let amountRequest;

      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //go to Billing > Upsells > Awaiting Approval
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)

      //prior to executing the deny, I will get the data in Row 1 that I will going to assert later ON at the Billing > Upsells > Rejected Tab Table list
      GETColumnsData = new Promise((resolve)=>{
        //GET the column 1 Service Name/Upsell Name Request
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > button').then((txt)=>{
          serviceName = txt.text().trim();
        })
        //GET the column 2 Client Name
        cy.get('table > tbody > tr:first-child > td:nth-child(2) > a').then((txt)=>{
          clientName = txt.text().trim();
        })
        //GET the column 3 Amount
        cy.get('table > tbody > tr:first-child > td:nth-child(3) > span').then((col3)=>{
          amountRequest = col3.text().replace(/\s+/g, ' ').trim();
        })
        resolve();
      })
 
      //click the review button
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(1000)

      //verify Upsell Request modal popup open
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')
      
      //verify Upsell Request modal title
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modaltitle)
        .should('exist')
        .and('have.text', ' Upsell Request')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Deny button then click if Found
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].DenyButton).scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Deny')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(239, 68, 68)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .click()
        .wait(3000)

      //verify another modal is open - Let the account manager know why you rejected the upsell request
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].modal)
        .should('exist')

      //verify modal title
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Let the account manager know why you rejected the upsell request')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Reasonf for Rejection * Label and textarea field
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].ReasonforRejectionLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Reason for rejection *')
            .find('span').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert textarea field
          cy.get('textarea[name="reason"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Share a reply')
        })
      
      //verify Cancel button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        .and('have.css', 'font-weight', '700') //font bold

      //verify Submit button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].SubmitButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Submit')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color

      /////// REQUIRED ASSERTIONS STARTS HERE ///////////

      //without enter any reason data, just click the submit button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].SubmitButton)
        .click()
        .wait(2000)

      //verify the Let the account manager know why you rejected the upsell request modal should remain open
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].modal)
        .should('exist')

      //verify Error text appeared - Required
      cy.get('form > div > div > div > div')
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now Enter Reason for Rejection data
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].ReasonforRejectionLabelandTextareafield)
        .find('textarea[name="reason"]')
        .clear()
        .type('I will deny this request as a test to deny an upsell request.')
        .wait(700)
        .should('have.value', 'I will deny this request as a test to deny an upsell request.')

      //At this stage, the Error Text should not exist
      cy.get('form > div > div > div > div')
        .should('not.exist')
      /////// REQUIRED ASSERTIONS ENDS HERE ///////////
        
      //Click the Submit button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].LettheaccountmanagerknowwhyyourejectedtheupsellrequestModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Upsell denied')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
      
      //Then as expected it should go to Billing > Upsells > Rejected Tab
      //verify Rejected Tab
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].RejectedTab)
        .should('exist')
        .and('have.text', 'Rejected')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default text color
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(24, 121, 216)').and('have.css', 'font-weight', '600') //after it was click

      //verify url destination that it goes to the correct tab
      cy.url().should('contain', '=rejected&filter=name&sizePerPage')
        
      //verify in Row 1 that it resides the denied request
      //// Rejected Tab page Table List Assertions Starts Here ////////////
      cy.get('table > tbody > tr:first-child').within(()=>{
        GETColumnsData.then(()=>{
          //assert Row 1 column 1 name Service
          billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', serviceName)
          //assert Row 1 column 2 name Client Name
          billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          //assert Row 1 column 3 name Amount
          billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', amountRequest)
        })
        //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'rejected', 'rgb(239, 68, 68)', 'rgb(254, 226, 226)')
        //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Row 1 column 7 name Rejector
        billingUpsells.verifyrow1column7AtRejectedtabRejector(' > td:nth-child(7)', 'PK', 'PeterKanluran')
        //assert Row 1 column 8 Action column
        billingUpsells.verifyrow1column8Action(' > td:nth-child(8) > button', 'be.disabled', 'View')
      })
      //// Rejected Tab page Table List Assertions Ends Here ////////////

      //I click the Row 1 column 1 Upsell Name link
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > button')
        .click()
        .wait(1000)

      ///// REJECTED TAB > UPSELL REQUEST MODAL ASSERTIONS STARTS HERE //////////

      //verify that the Upsell Request Modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')

      //verify Your upsell request was rejected section area
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].YourUpsellRequestWasRejectedSection)
        .should('exist')
        .and('have.css', 'background-color', 'rgb(254, 242, 242)')
        .then(($el) => {
          const computedStyle       = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-bg-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
        .within(()=>{
          //assert title section
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', 'Your upsell request was rejected')
            .and('have.css', 'font-weight', '700') // font bold
            .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
          //assert label Rejected By
          cy.get(' > label:nth-child(2)')
            .should('exist')
            .and('have.text', 'Rejected By')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the name of the rejector
          cy.get(' > p:nth-child(3)')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('Peter Kanluran')
            })
          //assert label Reason for Rejection
          cy.get(' > label:nth-child(4)')
            .should('exist')
            .and('have.text', 'Reason for rejection')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the reason data entered
          cy.get(' > p:nth-child(5)')
            .should('exist')
            .and('have.text', 'I will deny this request as a test to deny an upsell request.')
        })

      //verify status
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].StatusLabelandstatus)
        .should('exist')
        .within(()=>{
          //assert Status Label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Status')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the status elements
          cy.get('span')
            .should('exist')
            .and('have.text', 'rejected')
            .and('have.css', 'text-transform', 'capitalize')
            .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
            .and('have.css', 'background-color', 'rgb(254, 226, 226)') //background color that form like a capsule
            .and('have.css', 'border-radius', '9999px') //the curve edge of the background color
        })

      ///// REJECTED TAB > UPSELL REQUEST MODAL ASSERTIONS ENDS HERE //////////

      //I will have to close the button so that I may logout
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard

      //logout as the Approver / Project Manager
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
          
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //go to Client > Billing > Upsells
      //click the first top client test in the active client listing AAAROO TEST
      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS STARTS HERE //////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 2 that it should still be only a dash since this upsell request has been denied
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert row 1 column 4 the status that it should be Rejected
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'rejected', 'rgb(239, 68, 68)', 'rgb(254, 226, 226)')
        //assert row 1 column 7 Updated by the approver name who denied 
        tablelist.verifyrow1column7UpdatedbyExpectedName('> td:nth-child(7) > div', 'PK', 'PeterKanluran')
        //assert row 1 column 8 that it should be disabled the view button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'be.disabled', 'View')
      })

      //// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS ENDS HERE //////////

      //click the Service / Upsell Name link
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > button')
        .click(0)
        .wait(2000)

      //verify the upsell request modal popup open
      cy.get(cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist'))
  
      //verify Your upsell request was rejected section area
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].YourUpsellRequestWasRejectedSection)
        .should('exist')
        .and('have.css', 'background-color', 'rgb(254, 242, 242)')    // background-color area
        .then(($el) => {
          const computedStyle       = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-bg-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
        .within(()=>{
          //assert title section
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', 'Your upsell request was rejected')
            .and('have.css', 'font-weight', '700') // font bold
            .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
          //assert label Rejected By
          cy.get(' > label:nth-child(2)')
            .should('exist')
            .and('have.text', 'Rejected By')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the name of the rejector
          cy.get(' > p:nth-child(3)')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('Peter Kanluran')
            })
          //assert label Reason for Rejection
          cy.get(' > label:nth-child(4)')
            .should('exist')
            .and('have.text', 'Reason for rejection')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the reason data entered
          cy.get(' > p:nth-child(5)')
            .should('exist')
            .and('have.text', 'I will deny this request as a test to deny an upsell request.')
        })

      //verify status
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].StatusLabelandstatus)
        .should('exist')
        .within(()=>{
          //assert Status Label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Status')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the status elements
          cy.get('span')
            .should('exist')
            .and('have.text', 'rejected')
            .and('have.css', 'text-transform', 'capitalize')
            .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
            .and('have.css', 'background-color', 'rgb(254, 226, 226)') //background color that form like a capsule
            .and('have.css', 'border-radius', '9999px') //the curve edge of the background color
        })
    })
    it("Testcase ID: CCU0009 - Approve upsell request", ()=>{
      
      let GEThrefANDtext;
      let invoiceNumber;
      
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
        
       //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)
          
      //click the review button at Row 1 column 7
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(1000)

      //verify Upsell Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')

      //verify Approve button if found then click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].ApproveButton)
        .scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .click()
        .wait(3000)

      //verify This upsell request has been approved modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].modal)
        .should('exist')

      //verify modal title and check logo
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].modaltitleandcheckLogo)
        .should('exist')
        .within(()=>{
          //assert modal title
          cy.get(' > div > h3')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'This upsell request has been approved')
            .and('have.css', 'font-weight', '700')  // font bold
          //assert check logo
          cy.get(' > div  > div > span')
            .should('exist')
            .and('have.css', 'border-color', 'rgb(16, 185, 129)') //a circular color
            .find('svg').should('have.css', 'border-color', 'rgb(229, 231, 235)') //check color
        })
   
      //verify Do you want to send the client the billing summary email? text
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].DoyouwanttosendtheclientthebillingsummaryemailTEXT)
        .should('exist')
        .and('have.text', 'Do you want to send the client the billing summary email?')
        .and('have.css', 'color', 'rgb(148, 148, 148)')  //text color

      //verify No button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].NoButton)
        .should('exist')
        .and('have.text', 'No')
        .and('have.css', 'color', 'rgb(148, 148, 148)')  //text color
 
      //verify Send Email button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].SendEmailButton)
        .should('exist')
        .and('have.text', 'Send Email')
        .and('have.css', 'color', 'rgb(255, 255, 255)')            //text color
        .and('have.css', 'font-weight', '700')                     // font bold
        .and('have.css', 'background-color', 'rgb(16, 185, 129)')  //background color that shape like a capsule
        .and('have.css', 'border-radius', '9999px') 

      //click the Send Email button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].SendEmailButton)
        .click()
        .wait(2000)
            
      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'success')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)

      //go to Billing > Upsells > Pending Tab
      //verify Pending Tab then if Found click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].PendingTab)
        .should('exist')
        .and('have.text', 'Pending')
        .and('have.css', 'color', 'rgb(156, 163, 175)')  //text color
        .click()
        .wait(700)
        .should('have.css', 'color', 'rgb(24, 121, 216)').and('have.css', 'font-weight', '600') //text color and font bold

      //verify url destinationa after Pending tab is click
      cy.url().should('contain', '=pending')

      //// PENDING TAB PENDING APPROVAL UPSELLS TABLE LIST STARTS HERE /////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 4 invoice number should exist and has; also I will get the href link and the exact invoice number for later verification
        billingUpsells.verifyrow1column4InvoiceNumber(' > td:nth-child(4) > a')
        //Then here get that Invoice Number and store it in a variable
        GEThrefANDtext = new Promise((resolve)=>{
          cy.get(' > td:nth-child(4) > a')
            .should('exist')
            .and('not.be.disabled')
            .then((txt)=>{
              // Get the text content
              invoiceNumber = txt.text().trim();
            })
            resolve();
        })
        //assert row 1 column 5 status
        billingUpsells.verifyrow1column5Status(' > td:nth-child(5) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert also at this point that there is no 'seen' text below the status since it is not yet viewed by the client partner
        cy.get(' > td:nth-child(5) > div')
          .should('not.exist')
        //assert row 1 column 9 Action - has Resend button
        billingUpsells.verifyrow1column9Action(' > td:nth-child(9) > button', 'not.be.disabled', 'Resend')
      })
      //// PENDING TAB PENDING APPROVAL UPSELLS TABLE LIST ENDS HERE /////
        
      //logout as the Approver / Project Manager
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
          
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)
      
      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)
        
      ///// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS STARTS HERE ////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 2 invoice number
        GEThrefANDtext.then(()=>{
          tablelist.verifyrow1column2Invoicename(' > td:nth-child(2) > a', invoiceNumber)
        })
        //assert row 1 column 4 status as it should be Pending
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert at this point in time that there is no 'seen' below the status 
        cy.get(' > td:nth-child(4) > div')
          .should('not.exist')
        //assert row 1 column 8 action has resend button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled','Resend')
      })  
      ///// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CCU00010 - As a client partner, view the approved upsell request", ()=>{

      let GETclientEmailAddress;
      let clientEmailAddress;
      let GETInvoiceNumber;
      let invoiceNumber;
      let GETinvoiceNumberHREF;
      let InvoiceNumberHREF;
      

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //I will have to get firs the client email address for later use
      GETclientEmailAddress = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].OverviewClientEmailAddress)
          .should('exist')
          .then((email)=>{
            clientEmailAddress = email.text().trim();
            cy.log(`This is the current client email address -> ${clientEmailAddress}`)
          })
          resolve();
      })
      
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
        
       //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)
          
      //click the review button at Row 1 column 7
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(1000)

      //verify Upsell Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')

      //verify Approve button if found then click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].ApproveButton)
        .scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .click()
        .wait(3000)

      //verify This upsell request has been approved modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].modal)
        .should('exist')

      //click the Send Email button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].SendEmailButton)
        .click()
        .wait(2000)
            
      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'success')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)

      //go to Billing > Upsells > Pending Tab
      //verify Pending Tab then if Found click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].PendingTab)
        .should('exist')
        .and('have.text', 'Pending')
        .and('have.css', 'color', 'rgb(156, 163, 175)')  //text color
        .click()
        .wait(700)
        .should('have.css', 'color', 'rgb(24, 121, 216)').and('have.css', 'font-weight', '600') //text color and font bold

      //verify url destinationa after Pending tab is click
      cy.url().should('contain', '=pending')

      //// PENDING TAB PENDING APPROVAL UPSELLS TABLE LIST STARTS HERE /////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Service Name/Upsell Name Request
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert row 1 column 4 invoice number should exist and has; also I will get the href link and the exact invoice number for later verification
        billingUpsells.verifyrow1column4InvoiceNumber(' > td:nth-child(4) > a')
        //Then here get the Invoice Number and store it in a variable
        GETInvoiceNumber = new Promise((resolve)=>{
          cy.get(' > td:nth-child(4) > a')
            .should('exist')
            .and('not.be.disabled')
            .then((txt)=>{
              // Get the text content
              invoiceNumber = txt.text().trim();
            })
            resolve();
        })
        //assert row 1 column 5 status
        billingUpsells.verifyrow1column5Status(' > td:nth-child(5) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert also at this point that there is no 'seen' text below the status since it is not yet viewed by the client partner
        cy.get(' > td:nth-child(5) > div')
          .should('not.exist')
        //assert row 1 column 9 Action - has Resend button
        billingUpsells.verifyrow1column9Action(' > td:nth-child(9) > button', 'not.be.disabled', 'Resend')
      })
      //// PENDING TAB PENDING APPROVAL UPSELLS TABLE LIST ENDS HERE /////
        
      //logout as the Approver / Project Manager
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
          
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)
      
      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)
        
      ///// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS STARTS HERE ////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 2 invoice number
        GETInvoiceNumber.then(()=>{
          tablelist.verifyrow1column2Invoicename(' > td:nth-child(2) > a', invoiceNumber)
        })
        //assert row 1 column 4 status as it should be Pending
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert at this point in time that there is no 'seen' below the status 
        cy.get(' > td:nth-child(4) > div')
          .should('not.exist')
        //assert row 1 column 8 action has resend button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled','Resend')
      })  
      ///// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS ENDS HERE ////////
        
      //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //Then login as client partner   
      cy.get('#root').then(()=>{
        GETclientEmailAddress.then(()=>{
          cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, clientEmailAddress, 'qatesting123')
        })
      })
     
      //click the Invoice nav button
      cy.get(BSmodulesnavlink.ClientInvoicesnavlink)
        .click()
        .wait(2000)

      //verify expected url destination which is the Additional Services page
      cy.url().should('contain', '/additional-services')

      // When a user click the Invoices Module, it goes right away to Additional Services folder page and then view the Pending tab
      //verify that it goes into, first the Additional Services and to identify is that the text color changes into red
      cy.get(linktextfolders.ClientPartnerInvoicesModules[0].AdditionalServices_linktextFolder)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Additional Services')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //text color

      //next is the Pending tab text color changes to bold blue
      cy.get("nav[aria-label='Tabs'] > button[aria-current='page']")
        .should('exist')
        .and('have.text', 'Pending')
        .and('have.css', 'color', 'rgb(24, 121, 216)') //text color
        .and('have.css', 'font-weight', '600') //font bold

      ////////// ADDITIONAL SERVIECS > PENDING TAB > TABLE LIST ASSERTIONS STARTS HERE //////////////

      //verify the expected column names in the table
      const expectedcolumnNames = [
        'Invoice Number',
        'Service',
        'Amount',
        'Status',
        'Date',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($columnNames, index) => {
          cy.wrap($columnNames).should('have.text', expectedcolumnNames[index]) //verify names based on the expected options
            .should('exist')
            .and('be.visible')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            cy.log(expectedcolumnNames[index]) 
      });

      //verify row 1 since it is the target pending approved upsell request
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 1 Invoice Number
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETInvoiceNumber.then(()=>{
            additionalservicestablelist.verifyrow1column1InvoiceNumber(' > td:nth-child(1) > a', invoiceNumber);
          })
        })
        //For verification when I click the view button, I will get the href link of the Invoice Number
        GETinvoiceNumberHREF = new Promise((resolve)=>{
          cy.get(' > td:nth-child(1) > a').invoke('attr', 'href').then(hrefValue =>{
            InvoiceNumberHREF = hrefValue;
            cy.log('dasdasdsad '+InvoiceNumberHREF)
          })
        })
        //assert row 1 column 2 Service
        additionalservicestablelist.verifyrow1column2Service('> td:nth-child(2) > span', 'Copywriting Work')
        //assert row 1 column 3 Amount
        additionalservicestablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert row 1 column 4 Status
        additionalservicestablelist.verifyrow1column4Status(' > td:nth-child(4)  > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert row 1 column 5 Date
        additionalservicestablelist.verifyrow1column5Date(' > td:nth-child(5)  > span', utilfunc.getFormattedDate())
        //assert row 1 column 6 Action has view button
        additionalservicestablelist.verifyrow1column6Action(' > td:nth-child(6) > a', 'not.be.disabled', 'View')
      })
      ////////// ADDITIONAL SERVIECS > PENDING TAB > TABLE LIST ASSERTIONS ENDS HERE //////////////
      
      //click the view button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
   
      //Then verify correct destination after the view button is clicked
      cy.get('body').then(()=>{
        GETinvoiceNumberHREF.then(()=>{
          cy.url().should('contain', InvoiceNumberHREF)
        })
      })
      
      //verify Invoice Number title
      cy.get('div > h3')
        .should('exist')
        .and('have.css', 'font-weight', '700')  //font bold
        .then((el)=>{
          const invoiceNumberTitle = el.text().trim();
          GETInvoiceNumber.then(()=>{
            expect(invoiceNumberTitle).to.equal(invoiceNumber);
          })
        })

      //verify status
      cy.get('div.items-center > span.capitalize')
        .should('exist')
        .and('have.text', 'Pending')
        .and('have.css', 'color', 'rgb(245, 158, 11)')  //text color
        .and('have.css', 'background-color', 'rgb(254, 243, 199)') //background color
        .and('have.css', 'border-radius', '9999px')

      //logout as Client Partner 
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //verify in the same approved upsell request under the status there there will be a 'seen' label
      cy.get('table > tbody > tr:first-child > td:nth-child(4) > div')
        .should('exist')
        .within(()=>{
          //assert the check mark 
          cy.get('svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
          //assert the word seen
          cy.get('p')
            .should('exist')
            .and('have.text', 'seen')
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
        })   
    })
    it.skip("Testcase ID: CCU00011 - Client paid the approved upsell request", ()=>{

    })
    it("Testcase ID: CCU00012 - Approve upsell request but don’t send the email", ()=>{


      let GETClientName;
      let clientName;
      
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
        
       //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)
          
      //click the review button at Row 1 column 7
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(1000)

      //verify Upsell Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')

      //verify Approve button if found then click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].ApproveButton)
        .scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .click()
        .wait(3000)

      //verify This upsell request has been approved modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].modal)
        .should('exist')

      //click the Send No button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].NoButton)
        .click()
        .wait(2000)

      //As expected it goes to Billing > Upsells > Approved Tab
      //click the Approved Tab
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].ApprovedTab)
        .click()
        .wait(2000)

      //verify url destination to check if it goes to the Approved tab
      cy.url().should('contain', 'approved&filter')

      //// APPROVED TAB UPSELLS TABLE LIST STARTS HERE /////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 1 Service Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert row 1 column 2 Client Name
        cy.get(' > td:nth-child(2) > a')
          .should('exist')
          .then(()=>{
            GETClientName.then(()=>{
            billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          }) 
        })  
        //assert Row 1 column 3 name Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
            //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
            //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
            //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
            //assert Row 1 column 7 name Approver
        billingUpsells.verifyrow1column7Approver(' > td:nth-child(7)', 'PK', 'PeterKanluran')
            //assert Row 1 column 8 Action has Send
        billingUpsells.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', 'Send')
      })
      //// APPROVED TAB UPSELLS TABLE LIST ENDS HERE /////
      
      //logout as Project Manager / Approver
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
          
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)
      
      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)
   
      ///// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS STARTS HERE ////////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 2 Invoice Number as at this time it should be a dash character
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2)', '—')
        //assert row 1 column 4 status as it should be Approved
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
        //assert row 1 column 7 Updated by the approver
        tablelist.verifyrow1column7UpdatedbyExpectedName('> td:nth-child(7) > div', 'PK', 'PeterKanluran')
        //assert row 1 column 8 action has resend button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled','Send')
      })  
      ///// CLIENT > BILLING > UPSELLS TABLE LIST ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CCU00013 - Send the Email feature via the Account Specialist", ()=>{

      let GETClientName;
      let clientName;
      let GETclientEmailAddress;
      let clientEmailAddress;
      let GETInvoiceNumber;
      let thisInvoiceNumber;
      
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //I will have to get firs the client email address for later use
      GETclientEmailAddress = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].OverviewClientEmailAddress)
          .should('exist')
          .then((email)=>{
            clientEmailAddress = email.text().trim();
            cy.log(`This is the current client email address -> ${clientEmailAddress}`)
          })
          resolve();
      })

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
        
       //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)
          
      //click the review button at Row 1 column 7
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(1000)

      //verify Upsell Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')

      //verify Approve button if found then click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].ApproveButton)
        .scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .click()
        .wait(3000)

      //verify This upsell request has been approved modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].modal)
        .should('exist')

      //click the Send No button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].NoButton)
        .click()
        .wait(2000)

      //As expected it goes to Billing > Upsells > Approved Tab
      //click the Approved Tab
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].ApprovedTab)
        .click()
        .wait(2000)

      //verify url destination to check if it goes to the Approved tab
      cy.url().should('contain', 'approved&filter')

      //// APPROVED TAB UPSELLS TABLE LIST STARTS HERE /////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 1 Service Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert row 1 column 2 Client Name
        cy.get(' > td:nth-child(2) > a')
          .should('exist')
          .then(()=>{
            GETClientName.then(()=>{
            billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          }) 
        })  
        //assert Row 1 column 3 name Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
            //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
            //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
            //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
            //assert Row 1 column 7 name Approver
        billingUpsells.verifyrow1column7Approver(' > td:nth-child(7)', 'PK', 'PeterKanluran')
            //assert Row 1 column 8 Action has Send
        billingUpsells.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', 'Send')
      })
      //// APPROVED TAB UPSELLS TABLE LIST ENDS HERE /////

      //logout as the Approver / Project Manager
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
          
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)
      
      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Then I will click the Send button of the same approved upsell request
      cy.get('table > tbody > tr:first-child > td:nth-child(8) > button')
        .click()
        .wait(2000)

      //verify Are you sure you want to resend the billing summary invoice email to the client? Modal popup
      cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].modal)
        .should('exist')

      //verify modal title - Are you sure you want to resend the billing summary invoice email to the client?
      cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Are you sure you want to resend the billing summary invoice email to the client?')
        .and('have.css', 'font-weight', '700') // font bold

      //verify client email address  
      cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].modal)
        .then(()=>{
          GETclientEmailAddress.then(()=>{
            cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].ClientEmailAddressText)
              .should('exist')
              .and('have.text', clientEmailAddress)
              .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          })
        })
      
      //verify Cancel button
      cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color

      //verify Resend button
      cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].ResendButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Resend')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') //the curve edge of the background color

      //click the Resend button
      cy.get(clientmoduledata.cssSelectors[1].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].ResendButton)
        .click()
        .wait(3000)

      //reload the page
      cy.reload()
        .wait(8000) //giving 5 seconds waiting time to properly load the page
      
      //verify that same upsell that it should have now the invoice number at invoice number column, the status is Pending, the action column button is now a Resend button
      //and at the approver > billing > upsells > pending tab is transfered in there and lastly at the client partner it is now visible

      ///// CLIENT > BILLING > UPSELLS TABLE ASSERTIONS STARTS HERE //////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 2 Invoice number
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(2) > a', 'INV')
        //I WILL GET THE INVOICE NUMBER  
        GETInvoiceNumber = new Promise((resolve)=>{
            cy.get(' > td:nth-child(2) > a')
              .then((textInvoiceNumber)=>{
                thisInvoiceNumber = textInvoiceNumber.text().trim();
                resolve();
            })
          })
        //assert row 1 column 4 status as it should be Pending
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert row 1 column 8 action has resend button
        tablelist.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled','Resend')
      })
      ///// CLIENT > BILLING > UPSELLS TABLE ASSERTIONS ENDS HERE //////

      //logout as account specialist and then login as the approver / PM
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
  
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
        
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
     
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)

      //It is expected that it should go to Pending Tab
      //click the Pending Tab
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].PendingTab)
        .click()
        .wait(1000)

      ///// BILLING > UPSELLS > PENDING TAB TABLE LIST ASSERTIONS STARS HERE //////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 4 invoice number
        GETInvoiceNumber.then(()=>{
          cy.get(' > td:nth-child(4) > a')
            .should('exist')
            .and('not.be.disabled')
            .then((txt)=>{
              expect(txt.text().trim()).to.equal(thisInvoiceNumber);
            })
        })
        
        //assert row 1 column 5 status
        billingUpsells.verifyrow1column5Status(' > td:nth-child(5) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert row 1 column 9 Action - has Resend button
        billingUpsells.verifyrow1column9Action(' > td:nth-child(9) > button', 'not.be.disabled', 'Resend')
      })
      ///// BILLING > UPSELLS > PENDING TAB TABLE LIST ASSERTIONS ENDS HERE //////

      //logout as approver / PM then login as the Client partner
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
 
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //Then login as client partner   
      cy.get('#root').then(()=>{
        GETclientEmailAddress.then(()=>{
          cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, clientEmailAddress, 'qatesting123')
        })
      })

      //click the Invoice nav button
      cy.get(BSmodulesnavlink.ClientInvoicesnavlink)
        .click()
        .wait(2000)

      //verify expected url destination which is the Additional Services page
      cy.url().should('contain', '/additional-services')

      // When a user click the Invoices Module, it goes right away to Additional Services folder page and then view the Pending tab
      
      ////////// ADDITIONAL SERVIECS > PENDING TAB > TABLE LIST ASSERTIONS STARTS HERE //////////////

      //verify the expected column names in the table
      const expectedcolumnNames = [
        'Invoice Number',
        'Service',
        'Amount',
        'Status',
        'Date',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($columnNames, index) => {
          cy.wrap($columnNames).should('have.text', expectedcolumnNames[index]) //verify names based on the expected options
            .should('exist')
            .and('be.visible')
            .then(($el) => {
              const computedStyle       = getComputedStyle($el[0]);
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1')
            })
            cy.log(expectedcolumnNames[index]) 
      });

      //verify row 1 since it is the target pending approved upsell request
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 1 Invoice Number
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETInvoiceNumber.then(()=>{
            additionalservicestablelist.verifyrow1column1InvoiceNumber(' > td:nth-child(1) > a', thisInvoiceNumber);
          })
        })
        //assert row 1 column 2 Service
        additionalservicestablelist.verifyrow1column2Service('> td:nth-child(2) > span', 'Copywriting Work')
        //assert row 1 column 3 Amount
        additionalservicestablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert row 1 column 4 Status
        additionalservicestablelist.verifyrow1column4Status(' > td:nth-child(4)  > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert row 1 column 5 Date
        additionalservicestablelist.verifyrow1column5Date(' > td:nth-child(5)  > span', utilfunc.getFormattedDate())
        //assert row 1 column 6 Action has view button
        additionalservicestablelist.verifyrow1column6Action(' > td:nth-child(6) > a', 'not.be.disabled', 'View')
      })
      ////////// ADDITIONAL SERVIECS > PENDING TAB > TABLE LIST ASSERTIONS ENDS HERE //////////////
    })
    it("Testcase ID: CCU00014 - Send the Email feature via the Approver", ()=>{

 
      let GETClientName;
      let clientName;
      let GETclientEmailAddress;
      let clientEmailAddress;
      let GETInvoiceNumber;
      let thisInvoiceNumber;
      
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //I will have to get firs the client email address for later use
      GETclientEmailAddress = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].OverviewClientEmailAddress)
          .should('exist')
          .then((email)=>{
            clientEmailAddress = email.text().trim();
            cy.log(`This is the current client email address -> ${clientEmailAddress}`)
          })
          resolve();
      })

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///////// CREATE UPSELL REQUEST STARTS HERE //////////////
      
      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
        
       //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)

      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Upsells link text folder
      cy.get(linktextfolders.BILLINGmodules[0].Upsells_linktextFolder)
        .click()
        .wait(3000)
          
      //click the review button at Row 1 column 7
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(1000)

      //verify Upsell Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].modal)
        .should('exist')

      //verify Approve button if found then click
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].BillingUpsellRequestModal[0].ApproveButton)
        .scrollIntoView()
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .click()
        .wait(3000)

      //verify This upsell request has been approved modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].modal)
        .should('exist')

      //click the Send No button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].ThisupsellrequesthasbeenapprovedModal[0].NoButton)
        .click()
        .wait(2000)

      //As expected it goes to Billing > Upsells > Approved Tab
      //click the Approved Tab
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].ApprovedTab)
        .click()
        .wait(2000)

      //verify url destination to check if it goes to the Approved tab
      cy.url().should('contain', 'approved&filter')

      //// APPROVED TAB UPSELLS TABLE LIST STARTS HERE /////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 1 Service Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > button', 'Copywriting Work')
        //assert row 1 column 2 Client Name
        cy.get(' > td:nth-child(2) > a')
          .should('exist')
          .then(()=>{
            GETClientName.then(()=>{
            billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
          }) 
        })  
        //assert Row 1 column 3 name Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
            //assert Row 1 column 4 name Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
            //assert Row 1 column 5 name Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
            //assert Row 1 column 6 name Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
            //assert Row 1 column 7 name Approver
        billingUpsells.verifyrow1column7Approver(' > td:nth-child(7)', 'PK', 'PeterKanluran')
            //assert Row 1 column 8 Action has Send
        billingUpsells.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', 'Send')
      })
      //// APPROVED TAB UPSELLS TABLE LIST ENDS HERE /////

      //Then I will click the Send button of this approved upsell request
      cy.get('table > tbody > tr:first-child > td:nth-child(8) > button')
        .click()
        .wait(2000)

      //verify Are you sure you want to resend the billing summary invoice email to the client? Modal popup
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].modal)
        .should('exist')

      //verify modal title - Are you sure you want to resend the billing summary invoice email to the client?
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Are you sure you want to resend the billing summary invoice email to the client?')
        .and('have.css', 'font-weight', '700') // font bold

      //verify client email address
      GETclientEmailAddress.then(()=>{
        cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].ClientEmailAddressText)
        .should('exist')
        .and('have.text', clientEmailAddress)
        .and('have.css', 'color', 'rgb(148, 148, 148)') // text color
      })
      
      //verify Cancel button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color

      //verify Resend button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].ResendButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Resend')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') //the curve edge of the background color

      //Click the Resend button
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].AreyousureyouwanttoresendthebillingsummaryinvoiceemailtotheclientModal[0].ResendButton)
        .click()
        .wait(2000)

      //reload the page
      cy.reload()
        .wait(8000) //giving 5 seconds waiting time to properly load the page

      //Check again the status as it should change into Pending
      //click the Pending Tab
      cy.get(billingmoduledata.cssSelectors[0].UpsellsPage[0].pageTabs[0].PendingTab)
        .click()
        .wait(1000)

      ///// BILLING > UPSELLS > PENDING TAB TABLE LIST ASSERTIONS STARS HERE ////// 
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 4 Invoice Number
        billingUpsells.verifyrow1column4InvoiceNumber(' > td:nth-child(4) > a')
        //I will then GET this Invoice number and store it in a variable to use later for assertion
        GETInvoiceNumber = new Promise((resolve)=>{
          cy.get(' > td:nth-child(4) > a').then((txt)=>{
            thisInvoiceNumber = txt.text().trim();
          })
          resolve();
        })
        //assert row 1 column 5 status
        billingUpsells.verifyrow1column5Status(' > td:nth-child(5) > span', 'pending', 'rgb(245, 158, 11)', 'rgb(254, 243, 199)')
        //assert row 1 column 9 Action - has Resend button
        billingUpsells.verifyrow1column9Action(' > td:nth-child(9) > button', 'not.be.disabled', 'Resend')
      })
      ///// BILLING > UPSELLS > PENDING TAB TABLE LIST ASSERTIONS ENDS HERE //////

      //logout as Project Manager
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //// CLIENT BILLING > UPSELLS > TABLE LIST ASSERTIONS STARTS HERE ////////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert the Invoice Number
        GETInvoiceNumber.then(()=>{
          cy.get(' > td:nth-child(2) > a')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().trim()).to.equal(thisInvoiceNumber);
            })
        })
        //assert status 
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'pending','rgb(245, 158, 11)', 'rgb(254, 243, 199)')
      })
      //// CLIENT BILLING > UPSELLS > TABLE LIST ASSERTIONS ENDS HERE ////////
    })
    // **** CLIENT CREDIT NOTE STARTS HERE ***
    it("Testcase ID: CCCR0001 - Waive Upsell Fee, Upsell Request turned Credit Note Request",()=>{

      let GETClientName;
      let clientName;


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///// CREATE UPSELL REQUEST AND ENABLE THE WAIVE UPSELL STARTS HERE //////////

      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //verify waive upsell fee
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].WaiveUpsellFeelabelAndSlidebutton)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Waive Upsell Fee')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert button
          cy.get('button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'aria-checked', 'false') //by default it is off
            .and('have.css', 'background-color', 'rgb(229, 231, 235)') //expected background color when OFF
            .and('have.css', 'border-radius', '9999px') //the curve edge of the background color
        })

      //slide ON the waive upsell fee button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].WaiveUpsellFeelabelAndSlidebutton)
        .find('button')
        .click()
        .wait(1000)
        .should('have.css', 'background-color', 'rgb(16, 185, 129)').and('have.css', 'border-radius', '9999px') //the expected color after it was click

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)

      ///// CREATE UPSELL REQUEST AND ENABLE THE WAIVE UPSELL ENDS HERE //////////

      //verify as it is expected to automatically transferred to Client > Billing > Credit Notes Tab
      cy.get('div.tablinks > a:nth-child(4)')
        .should('exist')
        .and('have.text', ' Credit Notes')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //text color is red signifies that it is currently accessed
        .and('have.css', 'font-weight', '600') //font bold

      //verify that also the url destination is correct which is at the Credit Notes tab page
      cy.url().should('contain', '/billing/creditnotes')

      ////// CLIENT > BILLING > UPSELLS > TABLE LIST ASSERTIONS STARTS HERE ////////
      
      //verify Column Names
      const expected_columnNames = [
        'Name',
        'Date',
        'Amount',
        'Status',
        'Submitted By',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(expected_columnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column 1 > Service Name / Upsell Name Request
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert column 2 > Created/Submitted Date
        tablelist.verifyrow1column5Date(' > td:nth-child(2) > span', utilfunc.getFormattedDate())
        //assert column 3 > Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert row 1 column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert row 1 column 5 > Submitted By
        tablelist.verifyrow1column5Submittedby(' > td:nth-child(5)', 'LP', 'LoganPaul')
        //assert row 1 column 6 > Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(6)','—')
        //assert row 1 column 7 > Action column > has Cancel button
        tablelist.verifyrow1column8Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Cancel')
      })

      ////// CLIENT > BILLING > UPSELLS > TABLE LIST ASSERTIONS ENDS HERE ////////

      //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
         
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Credit Notes link text folder
      cy.get(linktextfolders.BILLINGmodules[0].CreditNotes_linktextFolder)
        .click()
        .wait(2000)

      //When a user access the Billing > Credit Notes folder page, it is automatically accessed the Awaiting Approval tab
      cy.url().should('contain', '=awaiting+approval')

      /////// BILLING > CREDIT NOTES > AWAITING APPROVAL TAB > TABLE LIST ASSERTIONS STARTS HERE //////////

      //verify column Names
      const AwaitingApprovalTableColumnNames = [
        'Name',
        'Client Name',
        'Amount',
        'Status',
        'Request Date',
        'Submitted By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', AwaitingApprovalTableColumnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(AwaitingApprovalTableColumnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Credit Note Request Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert Column 2 > Client Name
        GETClientName.then(()=>{
          billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
        })
        //assert Column 3 > Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Column 4 > Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Column 5 > Reqeust Date /Created Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Column 6 > Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Column 7 > Action:Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')
      })
      /////// BILLING > CREDIT NOTES > AWAITING APPROVAL TAB > TABLE LIST ASSERTIONS ENDS HERE //////////
    })
    it("Testcase ID: CCCR0002 - Deny Waive Upsell Fee, Upsell Request turned Credit Note Request",()=>{


      let GETClientName;
      let clientName;


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
      
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///// CREATE UPSELL REQUEST AND ENABLE THE WAIVE UPSELL STARTS HERE //////////

      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //slide ON the waive upsell fee button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].WaiveUpsellFeelabelAndSlidebutton)
        .find('button')
        .click()
        .wait(1000)
        .should('have.css', 'background-color', 'rgb(16, 185, 129)').and('have.css', 'border-radius', '9999px') //the expected color after it was click

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)

      ///// CREATE UPSELL REQUEST AND ENABLE THE WAIVE UPSELL ENDS HERE //////////

      //verify as it is expected to automatically transferred to Client > Billing > Credit Notes Tab
      cy.get('div.tablinks > a:nth-child(4)')
        .should('exist')
        .and('have.text', ' Credit Notes')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //text color is red signifies that it is currently accessed
        .and('have.css', 'font-weight', '600') //font bold

      //verify that also the url destination is correct which is at the Credit Notes tab page
      cy.url().should('contain', '/billing/creditnotes')

      ////// CLIENT > BILLING > UPSELLS > TABLE LIST ASSERTIONS STARTS HERE ////////
      
      //verify Column Names
      const expected_columnNames = [
        'Name',
        'Date',
        'Amount',
        'Status',
        'Submitted By',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(expected_columnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column 1 > Service Name / Upsell Name Request
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert column 2 > Created/Submitted Date
        tablelist.verifyrow1column5Date(' > td:nth-child(2) > span', utilfunc.getFormattedDate())
        //assert column 3 > Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert row 1 column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert row 1 column 5 > Submitted By
        tablelist.verifyrow1column5Submittedby(' > td:nth-child(5)', 'LP', 'LoganPaul')
        //assert row 1 column 6 > Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(6)','—')
        //assert row 1 column 7 > Action column > has Cancel button
        tablelist.verifyrow1column8Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Cancel')
      })

      ////// CLIENT > BILLING > UPSELLS > TABLE LIST ASSERTIONS ENDS HERE ////////
 
      //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
        
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Credit Notes link text folder
      cy.get(linktextfolders.BILLINGmodules[0].CreditNotes_linktextFolder)
        .click()
        .wait(2000)
      
      //When a user access the Billing > Credit Notes folder page, it is automatically accessed the Awaiting Approval tab
      cy.url().should('contain', '=awaiting+approval')

      /////// BILLING > CREDIT NOTES > AWAITING APPROVAL TAB > TABLE LIST ASSERTIONS STARTS HERE //////////

      //verify column Names
      const AwaitingApprovalTableColumnNames = [
        'Name',
        'Client Name',
        'Amount',
        'Status',
        'Request Date',
        'Submitted By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', AwaitingApprovalTableColumnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(AwaitingApprovalTableColumnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Credit Note Request Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert Column 2 > Client Name
        GETClientName.then(()=>{
          billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
        })
        //assert Column 3 > Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Column 4 > Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Column 5 > Reqeust Date /Created Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Column 6 > Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Column 7 > Action:Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')
      })
      /////// BILLING > CREDIT NOTES > AWAITING APPROVAL TAB > TABLE LIST ASSERTIONS ENDS HERE //////////
      
      //Now I click the Review button of the submitted upsell request waive upsell
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(2000)
        
      //verify Upsell to Credit Request / Credit Note Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].modal)
        .should('exist')

      //verify modal title
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Upsell to Credit Request')
        .and('have.css', 'font-weight', '700') // font bold

      //verify Client label and the Client Name itself
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].modal).then(()=>{
        GETClientName.then(()=>{
          cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestClientNameLabelandName)
            .should('exist')
            .and('contain', clientName)
            .find('label').should('exist').and('have.text', 'Client').and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        })
      })

      //verify Date Label and the Date
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestDatelabelandDate)
        .should('exist')
        .and('contain', utilfunc.getFormattedDate())
        .find('label').should('exist').and('have.text', 'Date').and('have.css', 'color', 'rgb(107, 114, 128)') //text color

      //verify Upsell Items Label and the Upsell Item name
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestUpsellItemLabelandUpsellItem)
        .should('exist')
        .and('contain', 'Copywriting Work')
        .find('label').should('exist').and('have.text', 'Upsell Items').and('have.css', 'color', 'rgb(107, 114, 128)') //text color

      //verify Quantity label and the number
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestQuantityLabelandNumber)
        .should('exist')
        .and('contain', '1')
        .find('label').should('exist').and('have.text', 'Quantity').and('have.css', 'color', 'rgb(107, 114, 128)') //text color

      //verify Unit Price Label and the Unit Price
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestUnitePriceLabelandUnitPrice)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Unit Price')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the Unit Price
          cy.get('span')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .find('span.text-grayscale-600').should('have.css', 'color', 'rgb(190, 190, 190)') //Dollar text color
        })

      //verify Total Label and the total and the Upsell Fee Waived status
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestTotalLabelandTotal)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Total')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the Unit Price
          cy.get('div > span')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95Upsell Fee Waived')
            })
            .find('span.text-grayscale-600').should('have.css', 'color', 'rgb(190, 190, 190)') //Dollar text color
        })

      //verify Upsell Description
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestUpsellDescriptionLabelandUpsellDescription)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Upsell Description')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the Upsell Description
          cy.get('p')
            .should('exist')
            .and('have.text', 'Copywriting Work')
        })

      //verify Service ASINs label
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestServiceASINsLabel)
        .should('exist')
        .and('have.text', 'Service ASINs')
        .and('have.css', 'font-weight', '400') //font bold

      //verify ASIN 1 label and the Asin 
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestASIN1andTheASIN)
        .should('exist')
        .and('contain', 'aldwinasin0123')
        .find('label').should('exist')
          .and('have.text', ' ASIN 1')
          .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
          .and('have.css', 'font-weight', '700') //font bold

      //verify Note Label and textarea field
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].UpselltoCreditRequestNoteLabelandNote)
        .scrollIntoView()
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Note')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert p tag since there is no  note entered data 
          cy.get('p')
            .should('exist')
        })

      //verify Deny button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].DenyButton)
        .should('exist')
        .and('have.text', 'Deny')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(239, 68, 68)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color

      //verify Approve button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].ApproveButton)
        .should('exist')
        .and('have.text', 'Approve')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color

      //Now Click the Deny button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].DenyButton)
        .click()
        .wait(2000)

      //verify What's the reason for denying this credit note request? modal popup
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].modal)
        .should('exist')

      //verify modal title
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].modaltitle)
        .should('exist')
        .and('have.text', `What's the reason for denying this credit note request?`)
        .and('have.css', 'font-weight', '700') //font bold

      //verify Reason textarea field
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].ReasonTextareafield)
        .should('exist')
        .and('have.value', '') //empty by default
        .and('have.attr', 'placeholder', 'Add a reason for rejecting this credit note request')
      
      //verify Cancel button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].CancelButton)
        .should('exist')
        .and('have.text', `Cancel`)
        .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        .and('have.css', 'font-weight', '700') //font bold

      //verify Deny button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].DenyButton)
        .should('exist')
        .and('have.text', `Deny`)
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(195, 0, 0)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
        .and('have.css', 'font-weight', '700') //font bold

      //// REQUIRED ASSERTIONS STARTS HERE /////////

      //Without enter a reason data, click the Deny button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].DenyButton)
        .click()
        .wait(1000)

      //verify the What's the reason for denying this credit note request? modal popup should remain open
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].modal)
        .should('exist')

      //verify Error Text - Required
      cy.get('form > div > div.text-red-700')
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now Enter Reason data
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].ReasonTextareafield)
        .clear()
        .type('I will Deny this waive upsell request for testing purpose.')
        .wait(700)
        .should('have.value', 'I will Deny this waive upsell request for testing purpose.')

      //Click again the Deny button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].WhatsthereasonfordenyingthiscreditnoterequestModal[0].DenyButton)
        .click()
        .wait(3000)
      //// REQUIRED ASSERTIONS ENDS HERE /////////

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Credit note request denied')
          
      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)
        
      //As expected it should go to Billing > Credit Notes > Denied Tab
      //verify Denied Tab if found then click
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].pageTabs[0].DeniedTab)
        .should('exist')
        .and('have.text', 'denied')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default text color
        .and('have.css', 'text-transform', 'capitalize')
        .click()
        .wait(2000)

      //verify that it goes to the Denied tab page
      cy.url().should('contain', '=denied')

      //verify that the text color is blue after I click the Denied tab and it is also in font bold
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].pageTabs[0].DeniedTab)
        .should('have.css', 'color', 'rgb(24, 121, 216)') //after it was click - text color
        .and('have.css', 'font-weight', '600') //font bold

      ///////// BILLING > CREDIT NOTES > DENIED TAB > TABLE LIST ASSERTIONS STARTS HERE ///////  

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Name
        billingUpsells.verifyrow1column1Servicename(' >td:nth-child(1) > a', 'Copywriting Work')
        //assert Column 2 > Client Name
        GETClientName.then(()=>{
          billingUpsells.verifyrow1column2Clientname(' >td:nth-child(2) > a', clientName)
        })
        //assert Column 3 > Amount
        billingUpsells.verifyrow1column3Amount(' >td:nth-child(3) > span', '$ 97.95')
        //assert Column 4 > Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'denied', 'rgb(239, 68, 68)', 'rgb(254, 226, 226)')
        //assert Column 5 > Request Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Column 6 > Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Column 7 > Updated By
        billingUpsells.verifyrow1column7AtRejectedtabRejector(' > td:nth-child(7) > div', 'PK', 'PeterKanluran')
        //assert Column 8 > Action:View
        billingUpsells.verifyrow1column8Action(' > td:nth-child(8) > button', 'not.be.disabled', 'View')
      })

      ///////// BILLING > CREDIT NOTES > DENIED TAB > TABLE LIST ASSERTIONS ENDS HERE ///////

      //Then click the view button
      cy.get('table > tbody > tr:first-child > td > button')
        .click()
        .wait(2000)

      //verify Upsell Credit Note Request modal popup open
      cy.get('div.opacity-100 > div.rounded-xl')
        .should('exist')
    
      //verify modal title
      cy.get('div.opacity-100 > div.rounded-xl > div > h3 > div > span')
        .should('exist')
        .and('have.text', 'Upsell  Credit Note Request')
        .and('have.css', 'font-weight', '700')  //font bold

      //verify the Denied section information
      cy.get('form > div > div.mb-4')
        .scrollIntoView()
        .should('exist')
        .and('have.css', 'background-color', 'rgb(254, 242, 242)')
        .within(()=>{
          //assert the Your credit note request was rejected text
          cy.get('p.text-xl')
            .should('exist')
            .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
            .and('have.css', 'font-weight', '700')  //font bold
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('Credit note request was rejected')
            })
          //assert label Rejected By
          cy.get(' > label:nth-child(2)')
            .should('exist')
            .and('have.text', 'Rejected By')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the Rejector Name
          cy.get(' > p.pb-2')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('Peter Kanluran')
            })
          //assert label Reason for Rejection
          cy.get(' > label:nth-child(4)')
            .should('exist')
            .and('have.text', 'Reason for rejection')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert The Reason entered data
          cy.get(' > p:nth-child(5)')
            .should('exist')
            .and('have.text', 'I will Deny this waive upsell request for testing purpose.')
        })

      //close the modal by pressing the {esc} key
      cy.get('body').type('{esc}');

      //logout as Project Manager
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
  
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //click the Credit Notes Tab
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesTabLink)
        .click()
        .wait(1000)

      ////// CLIENT > BILLING > CREDIT NOTES > TABLE LIST ASSERTION STARTS HERE //////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'denied', 'rgb(239, 68, 68)', 'rgb(254, 226, 226)')
        //assert Column 6 > Updatedt By
        tablelist.verifyrow1column6UpdatedbyExpectedName(' > td:nth-child(6)', 'PK', 'PeterKanluran')
        //assert Column 7 > Action:View
        tablelist.verifyrow1column8Action(' > td:nth-child(7) > button', 'be.disabled', 'View')
      })

      ////// CLIENT > BILLING > CREDIT NOTES > TABLE LIST ASSERTION ENDS HERE //////////
      
      //I will then click the Upsell Name/Credit note name
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)
      
      //verify Upsell Credit Note Request Modal popup
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].modal)
        .should('exist')
      
      //locate the denied section informations and assert
      cy.get('form >div > div.mb-4')
        .scrollIntoView()
        .should('exist')
        .within(()=>{
          //assert the Your credit note request was rejected text
          cy.get('p.text-xl')
            .should('exist')
            .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
            .and('have.css', 'font-weight', '700')  //font bold
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('Your credit note request was rejected')
            })
          //assert label Rejected By
          cy.get(' > label:nth-child(2)')
            .should('exist')
            .and('have.text', 'Rejected By')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the Rejector Name
          cy.get(' > p.pb-2')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('Peter Kanluran')
            })
          //assert label Reason for Rejection
          cy.get(' > label:nth-child(4)')
            .should('exist')
            .and('have.text', 'Reason for rejection')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert The Reason entered data
          cy.get(' > p:nth-child(5)')
            .should('exist')
            .and('have.text', 'I will Deny this waive upsell request for testing purpose.')
        })
    }) 
    it("Testcase ID: CCCR0003 - Approve Waive Upsell Fee, Upsell Request turned Credit Note Request",()=>{


      let GETClientName;
      let clientName;
      let GETCNnumber;
      let cnNumber;
      let GETInvoiceNumber;
      let theInvoiceNumber;


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
      
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      // Click the Upsells sub tab
      cy.get(clientmoduledata.cssSelectors[1].UpsellsTabLink)
        .click()
        .wait(1000)

      //Click Create Upsell button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellButton)
        .click()
        .wait(2000)

      //verify the Create Upsell modal
      cy.get(clientmoduledata.cssSelectors[1].modal)
        .should('exist')

      ///// CREATE UPSELL REQUEST AND ENABLE THE WAIVE UPSELL STARTS HERE //////////

      //Select Upsell item
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select')
        .select('1604151000000147020')
        .should('have.value', '1604151000000147020')

      //verify that it goes on top option 1
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellitemAndSelectDropdownmenu)
        .find('select option:selected')
        .should('have.text', 'Copywriting Work')

      //verify Unit Price value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UnitPricelabelAndInputfield)
        .find('.relative > input')
        .should('have.value', '97.95')

      //slide ON the waive upsell fee button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].WaiveUpsellFeelabelAndSlidebutton)
        .find('button')
        .click()
        .wait(1000)
        .should('have.css', 'background-color', 'rgb(16, 185, 129)').and('have.css', 'border-radius', '9999px') //the expected color after it was click

      //verify Upsell Description value updated
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].UpsellDescriptionlabelAndTextareafield)
        .find('textarea')
        .should('have.value', 'Copywriting Work')

      //Enter ASIN 1
      cy.get('input[name="serviceAsins.0.asin"]')
        .scrollIntoView()
        .type('aldwinasin0123')
        .should('have.value', 'aldwinasin0123')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreateUpsellModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Upsell Created')
      //cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Upsell Created')

      //click the x button to close the notification message popup
      cy.get('div.p-4 > div.w-full > button.bg-white')
        .click()
        .wait(1000)

      ///// CREATE UPSELL REQUEST AND ENABLE THE WAIVE UPSELL ENDS HERE //////////

      //verify as it is expected to automatically transferred to Client > Billing > Credit Notes Tab
      cy.get('div.tablinks > a:nth-child(4)')
        .should('exist')
        .and('have.text', ' Credit Notes')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //text color is red signifies that it is currently accessed
        .and('have.css', 'font-weight', '600') //font bold

      //verify that also the url destination is correct which is at the Credit Notes tab page
      cy.url().should('contain', '/billing/creditnotes')

      ////// CLIENT > BILLING > UPSELLS > TABLE LIST ASSERTIONS STARTS HERE ////////
      
      //verify Column Names
      const expected_columnNames = [
        'Name',
        'Date',
        'Amount',
        'Status',
        'Submitted By',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(expected_columnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column 1 > Service Name / Upsell Name Request
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert column 2 > Created/Submitted Date
        tablelist.verifyrow1column5Date(' > td:nth-child(2) > span', utilfunc.getFormattedDate())
        //assert column 3 > Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert row 1 column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert row 1 column 5 > Submitted By
        tablelist.verifyrow1column5Submittedby(' > td:nth-child(5)', 'LP', 'LoganPaul')
        //assert row 1 column 6 > Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(6)','—')
        //assert row 1 column 7 > Action column > has Cancel button
        tablelist.verifyrow1column8Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Cancel')
      })

      ////// CLIENT > BILLING > UPSELLS > TABLE LIST ASSERTIONS ENDS HERE ////////
      
      //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
        
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Credit Notes link text folder
      cy.get(linktextfolders.BILLINGmodules[0].CreditNotes_linktextFolder)
        .click()
        .wait(2000)
      
      //When a user access the Billing > Credit Notes folder page, it is automatically accessed the Awaiting Approval tab
      cy.url().should('contain', '=awaiting+approval')
      
      /////// BILLING > CREDIT NOTES > AWAITING APPROVAL TAB > TABLE LIST ASSERTIONS STARTS HERE //////////

      //verify column Names
      const AwaitingApprovalTableColumnNames = [
        'Name',
        'Client Name',
        'Amount',
        'Status',
        'Request Date',
        'Submitted By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', AwaitingApprovalTableColumnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(AwaitingApprovalTableColumnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Credit Note Request Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert Column 2 > Client Name
        GETClientName.then(()=>{
          billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
        })
        //assert Column 3 > Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 97.95')
        //assert Column 4 > Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Column 5 > Reqeust Date /Created Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Column 6 > Submitted By
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Column 7 > Action:Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')
      })
      /////// BILLING > CREDIT NOTES > AWAITING APPROVAL TAB > TABLE LIST ASSERTIONS ENDS HERE //////////
      
      //Now I click the Review button of the submitted upsell request waive upsell
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(2000)
        
      //verify Upsell to Credit Request / Credit Note Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].modal)
        .should('exist')

      //Click the Approve button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].ApproveButton)
        .scrollIntoView()
        .click()
        .wait(3000)
      
      //verify Are you sure you want to approve the request to waive the upsell fee? modal popup
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].AreyousureyouwanttoapprovetherequesttowaivetheupsellfeeModal[0].modal)
        .should('exist')

      //verify modal title
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].AreyousureyouwanttoapprovetherequesttowaivetheupsellfeeModal[0].modaltitle)
        .should('exist')
        .and('have.text', `Are you sure you want to approve the request to waive the upsell fee?`)

      //verify If you click approve, a paid invoice will be automatically generated text
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].AreyousureyouwanttoapprovetherequesttowaivetheupsellfeeModal[0].IfyouclickapproveapaidinvoicewillbeautomaticallygeneratedTEXT)
        .should('exist')
        .then((txt)=>{
          expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('If you click approve, a paid invoice will be automatically generated')
        })
        .find('span').should('have.text', 'approve').and('have.css', 'color', 'rgb(0, 150, 109)') // approve text color

      //verify Cancel button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].AreyousureyouwanttoapprovetherequesttowaivetheupsellfeeModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color

      //verify Approve button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].AreyousureyouwanttoapprovetherequesttowaivetheupsellfeeModal[0].ApproveButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') //the curve edge of the background color

      //Click the Approve button
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].AreyousureyouwanttoapprovetherequesttowaivetheupsellfeeModal[0].ApproveButton)
        .click()
        .wait(6000)
        
      //As expected it will go to Billing > Credit Notes > Applied Tab
      //verify Applied tab if found then click
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].pageTabs[0].AppliedTab)
        .should('exist')
        .and('have.text', 'applied')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //text color before it is click
        .click()
        .wait(2000)
        .should('have.css', 'color', 'rgb(24, 121, 216)') //after it was click

      //verif url destination
      cy.url().should('contain', '=applied')

      /////////// BILLING > CREDIT NOTES > APPLIED TAB > TABLE LIST ASSERTIONS STARTS HERE ////////////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Credit Notes Request Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Copywriting Work')
        //assert Column 2 > Client Name  
        GETClientName.then(()=>{
          billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
        })
        //assert Column 3 > CN#
        billingUpsells.verifyrow1column3CN(' > td:nth-child(3)', 'CN-')
        //GET the CN number and store in a variable
        GETCNnumber = new Promise((resolve)=>{
          cy.get(' > td:nth-child(3)').then((cnNum)=>{
            cnNumber = cnNum.text().trim();
          })
        })
        //assert Column 4 > Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(4) > span', '$ 97.95')
        //assert Column 5 > Status
        billingUpsells.verifyrow1column5Status(' > td:nth-child(5) > span', 'applied', 'rgb(16, 185, 129)', 'rgb(209, 250, 229)')
        //assert Column 6 > Request Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(6) > span', utilfunc.getFormattedDate())
        //assert Column 7 > Submitted By
        billingUpsells.verifyrowcolumn7Submittedby(' > td:nth-child(7)', 'LP', 'LoganPaul')
        //assert Column 8 > Updated By
        billingUpsells.verifyrow1column8Approver(' > td:nth-child(8)', 'PK', 'PeterKanluran')
        //assert Column 9 > Action:View
        billingUpsells.verifyrow1column9Action(' > td:nth-child(9) > button', 'not.be.disabled', 'View')
      })

      /////////// BILLING > CREDIT NOTES > APPLIED TAB > TABLE LIST ASSERTIONS ENDS HERE ////////////////

      //then I will click the View button
      cy.get('table > tbody > tr:first-child > td > button')
        .click()
        .wait(2000)

      //verify Upsell Credit Note Request modal popup
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].modal)
        .should('exist')


      ////// UPSELL CREDIT NOTE REQUEST MODAL ELEMENTS ASSERTIONS STARTS HERE //////////

      //verify Credit note details label
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].CreditNoteDetailsLabel)
        .scrollIntoView()
        .should('exist')
        .and('have.text', 'Credit note details')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Amount $ 97.95 (incl. invoice tax, if applicable)
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].AmountLabelandValue)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Amount')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert $0.00
          cy.get(' > div > span.text-inherit')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .find('span.text-grayscale-600').should('have.css', 'color', 'rgb(190, 190, 190)') //text color
          //assert (incl. invoice tax, if applicable)
          cy.get(' > div > span.text-grayscale-700')
            .should('exist')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-style', 'italic')
            .and('have.css', 'font-size', '11px')
        })

      //verify ZOHO Credit Note Label and CN# number
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].ZohoCreditNoteLabelandCNNumber)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Zoho Credit Note')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert CN number
          GETCNnumber.then(()=>{
            cy.get('div > span')
              .should('exist')
              .and('have.text', cnNumber)
          })
          //assert View PDF button
          cy.get("div > button[title='View PDF']")
            .should('exist')
            .and('not.be.disabled')
          //assert Download PDF button
          cy.get("div > button[title='Download PDF']")
            .should('exist')
            .and('not.be.disabled')
        })

      //verify Credits applied to invoices label
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].CreditsappliedtoinvoicesLabel)
        .should('exist')
        .and('have.text', 'Credits applied to invoices')
        .and('have.css', 'color', 'rgb(107, 114, 128)') //text color

      //verify Credits applied to invoices section - column names
      const expectedColumnNames = [
        'Invoice Number',
        'Applied Credits',
        'Applier',
        'Date Applied'
      ];
      cy.get('div.bg-grayscale-400 > div').each(($option, index) => {
        cy.wrap($option).should('have.text', expectedColumnNames[index]) //verify names based on the expected options
          .should('exist')
          .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          cy.log(expectedColumnNames[index]) 
      });

      //verify under the Credits applied to invoices section
      cy.get('form > div > div > div.flex-col > div > div:nth-child(2)')
        .should('exist')
        .within(()=>{
          //assert check mark beside the invoice number
          cy.get(' > p > svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
          //assert Invoice Number link text
          cy.get(' > p > a')
            .should('exist')
            .and('not.be.disabled')
          //Then I will get the invoice number and store it in a variable for later verification
          GETInvoiceNumber = new Promise((resolve)=>{
            cy.get(' > p > a')
              .then((txt)=>{
                theInvoiceNumber = txt.text().trim();
              })
              resolve();
          })
          //assert Applied credit amount
          cy.get(' > div > span')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
            .find('span').should('have.text', '$').and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          //assert Applier Name
          cy.get(' > div.text-center')
            .should('exist')
            .and('have.text', 'Peter Kanluran')
          //assert Date Applied
          cy.get(' > p.text-center')
            .should('exist')
            .and('contain', utilfunc.getFormattedDate())
        })
      
      //verify Remaining Credits Label and the amount
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].RemainingCreditsLabelandAmount)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Remaining Credits:')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the amount
          cy.get('p')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 0.00')
            })
            .find('span.text-3xl').should('have.text', '$').and('have.css', 'color', 'rgb(190, 190, 190)') //text color
        })

      //verify Credits Applied Label and the amount
      cy.get(billingmoduledata.cssSelectors[0].CreditNotesPage[0].CreditNoteRequestModal[0].CreditsAppliedLabelandAmount)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Credits Applied:')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the amount
          cy.get('p')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .find('span.text-3xl').should('have.text', '$').and('have.css', 'color', 'rgb(190, 190, 190)') //text color
        })

      ////// UPSELL CREDIT NOTE REQUEST MODAL ELEMENTS ASSERTIONS ENDS HERE //////////

      //close the modal
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard

      //logout as project manager
      //click the user account profile 
       cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
 
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //click the Credit Notes Tab
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesTabLink)
        .click()
        .wait(1000)

      ////// CLIENT > BILLING > CREDIT NOTES > TABLE LIST ASSERTION STARTS HERE //////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'applied', 'rgb(16, 185, 129)', 'rgb(209, 250, 229)')
        //assert Column 6 > Updated By
        tablelist.verifyrow1column6UpdatedbyExpectedName(' > td:nth-child(6)', 'PK', 'PeterKanluran')
      })

      ////// CLIENT > BILLING > CREDIT NOTES > TABLE LIST ASSERTION ENDS HERE //////////

      //Then I will click the view button
      cy.get('table > tbody > tr:first-child > td:nth-child(7) > button')
        .click()
        .wait(2000)

      //verify Upsell Credit Note Request modal popup
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].modal)
        .should('exist')

      ////// CLIENT > BILLING > CREDIT NOTES > UPSELL CREDIT NOTE REQUEST MODAL ELEMENTS ASSERTIONS STARTS HERE //////////

      //verify Credit note details label
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditNoteDetailsLabel)
        .scrollIntoView()
        .should('exist')
        .and('have.text', 'Credit note details')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Amount $ 97.95 (incl. invoice tax, if applicable)
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].AmountLabelandValue)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Amount')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert $0.00
          cy.get(' > div > span.text-inherit')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .find('span.text-grayscale-600').should('have.css', 'color', 'rgb(190, 190, 190)') //text color
          //assert (incl. invoice tax, if applicable)
          cy.get(' > div > span.text-grayscale-700')
            .should('exist')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-style', 'italic')
            .and('have.css', 'font-size', '11px')
        })

      //verify ZOHO Credit Note Label and CN# number
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].ZohoCreditNoteLabelandCNNumber)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Zoho Credit Note')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert CN number
          GETCNnumber.then(()=>{
            cy.get('div > span')
              .should('exist')
              .and('have.text', cnNumber)
          })
          //assert View PDF button
          cy.get("div > button[title='View PDF']")
            .should('exist')
            .and('not.be.disabled')
          //assert Download PDF button
          cy.get("div > button[title='Download PDF']")
            .should('exist')
            .and('not.be.disabled')
        })

      //verify Credits applied to invoices label
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditsappliedtoinvoicesLabel)
        .should('exist')
        .and('have.text', 'Credits applied to invoices')
        .and('have.css', 'color', 'rgb(107, 114, 128)') //text color

      //verify Credits applied to invoices section - column names
      const expectColumnNames = [
        'Invoice Number',
        'Applied Credits',
        'Applier',
        'Date Applied'
      ];
      cy.get('div.bg-grayscale-400 > div').each(($option, index) => {
        cy.wrap($option).should('have.text', expectColumnNames[index]) //verify names based on the expected options
          .should('exist')
          .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          cy.log(expectColumnNames[index]) 
      });
      
      //verify under the Credits applied to invoices section
      cy.get('form > div > div > div.flex-col > div > div:nth-child(2)')
        .should('exist')
        .within(()=>{
          //assert check mark beside the invoice number
          cy.get(' > p > svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
          //assert Invoice Number link text
          cy.get(' > p > a')
            .should('exist')
            .and('not.be.disabled')
          //Then I will get the invoice number and store it in a variable for later verification
          GETInvoiceNumber = new Promise((resolve)=>{
            cy.get(' > p > a')
              .then((txt)=>{
                theInvoiceNumber = txt.text().trim();
              })
              resolve();
          })
          //assert Applied credit amount
          cy.get(' > div > span')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
            .find('span').should('have.text', '$').and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          //assert Applier Name
          cy.get(' > div.text-center')
            .should('exist')
            .and('have.text', 'Peter Kanluran')
          //assert Date Applied
          cy.get(' > p.text-center')
            .should('exist')
            .and('contain', utilfunc.getFormattedDate())
        })

      //verify Remaining Credits Label and the amount
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].RemainingCreditsLabelandAmount)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Remaining Credits:')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the amount
          cy.get('p')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 0.00')
            })
            .find('span.text-3xl').should('have.text', '$').and('have.css', 'color', 'rgb(190, 190, 190)') //text color
        })

      //verify Credits Applied Label and the amount
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditsAppliedLabelandAmount)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Credits Applied:')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the amount
          cy.get('p')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.contain('$ 97.95')
            })
            .find('span.text-3xl').should('have.text', '$').and('have.css', 'color', 'rgb(190, 190, 190)') //text color
        })

      ////// CLIENT > BILLING > CREDIT NOTES > UPSELL CREDIT NOTE REQUEST MODAL ELEMENTS ASSERTIONS ENDS HERE //////////

    })
    it.only("Testcase ID: CCCR0004 - Create Credit Note Request. Clients with no pending, or overdue invoices",()=>{

      let GETClientName;
      let clientName;

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //click the Credit Notes Tab
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesTabLink)
        .click()
        .wait(1000)

      //verify Create Credit button - if found then click
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreateCreditButon)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', ' Create Credit')
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.css', 'border-color', 'rgb(30, 58, 138)')
        .and('have.css', 'border-radius', '9999px')
        .click()
        .wait(2000)

      //verify Create Credit Note Request Modal popup
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].modal)
        .should('exist')

      /////////// CLIENT > BILLING > CREDIT NOTES TAB > CREATE CREDIT NOTE REQUEST MODAL ASSERTIONS STARTS HERE ////////////////

      //verify modal title
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'create Credit Note Request')
        .and('have.css', 'font-weight', '700') // font bold

      //verify Credit Note Name Label and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditNoteNameLabelandInputfield)
        .should('exist')
        .within(()=>{
          //assert Credit Note Name Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Credit Note Name*')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //text color
          //assert Input field
          cy.get(' > input[name="name"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Enter Credit Note Name')
        })

      //verify Description Label and Textarea field
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].DescriptionLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert Description Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Description*')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //text color
          //assert Textarea field
          cy.get(' > textarea[name="description"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Enter Credit Note Description')
        })

      //verify Requester Note Label and Textarea field
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].RequesterNoteLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert Requester Note Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Requester Note*')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //text color
          //assert Textarea field
          cy.get(' > textarea[name="notes"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Enter Requester Note')
        })

      //verify Credit Request Amount Label, Dollar Sign, and Input field
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditRequestAmountLabel_DollarSign_Inputfield)
        .should('exist')
        .within(()=>{
          //assert Credit Request Amount Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Credit Request Amount*')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //text color
          //assert Dollar Sign
          cy.get(' > div > span')
            .should('exist')
            .and('have.text', '$')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '600') // font bold
          //assert Input field
          cy.get(' > div > input[name="amount"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '0') //default value
            .and('have.attr', 'placeholder', 'Enter Credit Request Amount')
        })

      //verify Save as Draft Button
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].SaveasDraftButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Save as Draft')
        .and('have.css', 'color', 'rgb(24, 121, 216)') //text color
        .and('have.css', 'font-weight', '700') // font bold

      //verify Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].SubmitButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Submit')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px')
        .and('have.css', 'font-weight', '700') // font bold

      /////////// CLIENT > BILLING > CREDIT NOTES TAB > CREATE CREDIT NOTE REQUEST MODAL ASSERTIONS ENDS HERE ////////////////

      ////////// REQUIRED ASSERTIONS STARTS HERE ////////////  

      //without enter any data on any fields, click the Submit button
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert-error text message 
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Errors found')
      cy.getMessagepopup(alertmessageslocators.updatemessage, "Credit Note Name is required\nDescription is required\nCredit Request Amount must be >= 1\nRequester Note is required")
        
      //verify the Create Credit Note Request Modal should remain open
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].modal)
        .should('exist')

      //verify Error Text 1 - Credit Note Name is required
      cy.get('form > div > div:nth-child(1) > div')
        .should('exist')
        .and('have.text', 'Credit Note Name is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 2 - Description is required
      cy.get('form > div > div:nth-child(2) > div')
        .should('exist')
        .and('have.text', 'Description is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 3 - Requester Note is required
      cy.get('form > div > div:nth-child(3) > div')
        .should('exist')
        .and('have.text', 'Requester Note is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 4 - Credit Request Amount must be >= 1
      cy.get('form > div > div:nth-child(4) > div:nth-child(3)')
        .should('exist')
        .and('have.text', "Credit Request Amount must be >= 1")
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Enter Credit Note Name
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditNoteNameLabelandInputfield)
        .find(' > input[name="name"]')
        .clear()
        .type('Credit Request For Test')
        .wait(600)
        .should('have.value', 'Credit Request For Test')

      //Enter Description
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].DescriptionLabelandTextareafield)
        .find(' > textarea[name="description"]')
        .clear()
        .type('This description is for testing purposes only')
        .wait(600)
        .should('have.value', 'This description is for testing purposes only')

      //Enter Requester Note
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].RequesterNoteLabelandTextareafield)
        .find(' > textarea[name="notes"]')
        .clear()
        .type('This requester note is for testing purposes only')
        .wait(600)
        .should('have.value', 'This requester note is for testing purposes only')

      //Enter Credit Request Amount
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].CreditRequestAmountLabel_DollarSign_Inputfield)
        .find(' > div > input[name="amount"]')
        .clear()
        .type('447')
        .wait(600)
        .should('have.value', '447')

      //Click Submit Button
      cy.get(clientmoduledata.cssSelectors[1].CreditNotesPage[0].CreditNotesModal[0].SubmitButton)
        .click()
        .wait(3000)

      //verify alert success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Your credit note request has been sent for approval')
      cy.getMessagepopup(alertmessageslocators.updatemessage, "Credit note request created.")
        
      //here I am going to click the x button in the alert-success message popup
      cy.get('div.p-4 > div.w-full > button')
        .click()
        .wait(1000)

      ////////// REQUIRED ASSERTIONS ENDS HERE ////////////  
        
      ///////////// CLIENT > BILLING > CREDIT NOTES TAB > TABLE LISTS ASSERTIONS STARTS HERE ///////////////

      //verify Column names
      const expectedcolumnNames = [
        'Name',
        'Date',
        'Amount',
        'Status',
        'Submitted By',
        'Updated By',
        'Action'
      ]
      cy.get('table > thead > tr > th').each(($name, index)=>{
        cy.wrap($name)
          .should('exist')
          .and('have.text', expectedcolumnNames[index])
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          .and('have.css', 'font-weight', '700') // font bold
      })

      //Then assert the Row 1 each column data
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Credit Note Name
        tablelist.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Credit Request For Test')
        //assert Column 2 > Date
        tablelist.verifyrow1column5Date(' > td:nth-child(2) > span', utilfunc.getFormattedDate())
        //assert Column 3 > Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 447.00')
        //assert Column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert Column 5 > Submitted By
        tablelist.verifyrow1column5Submittedby(' > td:nth-child(6)', 'LP', 'LoganPaul')
        //assert Column 6 > Updated By
        tablelist.verifyrow1column7Updatedby(' > td:nth-child(6)', '—')
        //assert Column 7 > Action:Cancel
        tablelist.verifyrow1column8Action(' > td:nth-child(7) > button', 'not.be.disabled', ' Cancel')
      })
      ///////////// CLIENT > BILLING > CREDIT NOTES TAB > TABLE LISTS ASSERTIONS ENDS HERE ///////////////

      //logout as account specialist
      //click the user account profile 
      cy.get(accountprofilesettingslocator.useraccountprofilepicinitial)
        .click()
        .wait(1000)
   
      //click the sign out link text
      cy.get(accountprofilesettingslocator.signoutlinktext)
        .click()
        .wait(3000)
        
      //login as the Project Manager
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //Click Billing Nav button 
      cy.get(BSmodulesnavlink.billingnavlink)
        .click()
        .wait(3000)

      //Click the Credit Notes link text folder
      cy.get(linktextfolders.BILLINGmodules[0].CreditNotes_linktextFolder)
        .click()
        .wait(2000)
      
      //When a user access the Billing > Credit Notes folder page, it is automatically accessed the Awaiting Approval tab
      cy.url().should('contain', '=awaiting+approval')

      ////////// BILLING > CREDIT NOTES > AWAITING APPROVAL TABLE LIST ASSERTIONS STARTS HERE /////////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert row 1 column 1 > Credit Note Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Credit Request For Test')
        //assert row 1 column 2 > Client Name
        GETClientName.then(()=>{
          billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', clientName)
        })
        //assert row 1 column 3 > Amount
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(3) > span', '$ 447.00')
        //assert row 1 column 4 > Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(4) > span', 'awaiting approval', 'rgb(212, 130, 54)', 'rgb(255, 210, 185)')
        //assert row 1 column 5 > Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert row 1 column 6 > Submitted by
        billingUpsells.verifyrow1column6Submittedby(' > td:nth-child(6)', 'LP','LoganPaul')
        //assert row 1 column 7 > Action Review button
        billingUpsells.verifyrow1column7Action(' > td:nth-child(7) > button', 'not.be.disabled', 'Review')
      })

      ////////// BILLING > CREDIT NOTES > AWAITING APPROVAL TABLE LIST ASSERTIONS ENDS HERE /////////////

    })
    it("Testcase ID: CCCR0005 - Cancel the Credit Note Request",()=>{

      
      
      
      
      let currentclientname;
      let currentclientemailaddress;
   
        //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
          
        //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

        //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)
      
        //GET current client name as the H1 title
      cy.get(clientmodules.testclientpagemaintitle).then((textName)=>{
          currentclientname = textName.text().trim()
          cy.log(" THIS IS THE CURRENT CLIENT NAME "+currentclientname)
      })

        //GET the current client email address
      cy.get(clientmodules.clientdashboardtab[1].overviewclientinformation[0].clientsemailaddress)
        .then(cemail=>{
          currentclientemailaddress = cemail.text();
          cy.log(currentclientemailaddress)
        })
           
        //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

        //go to credit notes tab
      cy.click_link_button(clientmodules.billingtab[3].creditnotestablink).wait(2000)
        
        //here i will pick the row 1 which was recently added on Testcase ID: CCCR0004
        //i will click the cancel button
      cy.click_link_button('table > tbody > tr:first-child > td > button')
        .wait(2000)

        //verify the cancel credit note modal popup
      cy.get(clientmodules.billingtab[3].cancelcreditnotemodal[0].modal)
        .should('exist')
        .and('be.visible')

        //verify modal title
      cy.get(clientmodules.billingtab[3].cancelcreditnotemodal[0].modaltitle)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Cancel Credit Note?')
        .and('have.css', 'font-weight', '700')  //font bold

        //verify Credit Note Name label and the credit note name itself
      cy.get(clientmodules.billingtab[3].cancelcreditnotemodal[0].creditnotenamelabelandThecreditnotename)
        .should('exist')
        .and('be.visible')
        .then((el)=>{
          expect(el.text().replace(/\s+/g, ' ').trim()).to.equal('Credit Note Name: Credit Note Request Number 1')
          //assert that the credit note name itself is in bold
          cy.get('div.my-8 > div.text-gray-500 > div > span:nth-child(1) > b')
            .should('have.css', 'font-weight', '700')  //font bold
        })

        //verify the amount label and its amount user-inputted
      cy.get(clientmodules.billingtab[3].cancelcreditnotemodal[0].amountlabelanditsamount)
        .should('exist')
        .and('be.visible')
        .then((el)=>{
          expect(el.text().replace(/\s+/g, ' ').trim()).to.equal('Amount: $600')
          //assert that the credit note name itself is in bold
          cy.get('div.my-8 > div.text-gray-500 > div > span:nth-child(2) > b')
            .should('have.css', 'font-weight', '700')  //font bold
        })

        //verify no button
      cy.get(clientmodules.billingtab[3].cancelcreditnotemodal[0].nobutton)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'No')
        .and('have.css', 'font-weight', '700')  //font bold
        .and('have.css', 'color', 'rgb(148, 148, 148)')  //text color
        .then((txt)=>{
          const computedStyle = getComputedStyle(txt[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1');
        })

        //verify Yes button
      cy.get(clientmodules.billingtab[3].cancelcreditnotemodal[0].yesbutton)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Yes')
        .and('have.css', 'font-weight', '700')  //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)')  //text color
        .and('have.css', 'background-color', 'rgb(5, 150, 105)') //background color that form like a capsule
        .and('have.css', 'border-radius', '40px') // the curve edge

        //click the Yes button
      cy.click_link_button(clientmodules.billingtab[3].cancelcreditnotemodal[0].yesbutton)
        .wait(2000)

        //verify alert-error text message 
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Success')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Credit request updated.')

        //intentionally wait to close the alert-success 
      cy.wait(2000)
          
        //verify on that cancelled credit note request status as it should be Cancelled
      cy.get('table > tbody > tr:first-child > td:nth-child(4) > span')
        .should('exist')
        .and('be.visible')
        .and('have.text', 'cancelled')
        .and('have.css', 'text-transform', 'capitalize')
        .and('have.css', 'color', 'rgb(239, 68, 68)')  //text color
        .and('have.css', 'background-color', 'rgb(254, 226, 226)') //background color that form like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge

        //verify also at the action column that from cancel it becomes View button but disabled
      cy.get('table > tbody > tr:first-child > td > button')
        .should('exist')
        .and('be.visible')
        .and('be.disabled')
        .and('have.text', ' View')
        .and('have.css', 'font-weight', '700')                  //font bold
        .and('have.css', 'color','rgb(148, 148, 148)')          //text color
        .and('have.css', 'border-color', 'rgb(148, 148, 148)')  //the line that forms a square of a button
        .and('have.css', 'border-radius', '12px')               //the curve edge of the button
        .and('have.css', 'width', '108px')
        .and('have.css', 'height', '40px')


        // last verification is at the Billing > Credit Notes > Awaiting Approval as it should not exist anymore
    })
    it.skip("Testcase ID: CCCR0006 - Apply to Next Month Invoice [Enter Total Max Credit amount]",()=>{

      let currentclientname;
      let currentclientemailaddress;
      let creditNoteName;
      let cnNumber;

        //calling utility functions
      const utilfunc = new utilityfunctions();

        //calling billing_upsells
      const billingUpsells = new billingupsells();

        //calling client_billing_upsells_tablelist
      const tablelist = new upsellstablelist();
       
        //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
          
        //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

        //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)
      
        //GET current client name as the H1 title
      cy.get(clientmodules.testclientpagemaintitle).then((textName)=>{
          currentclientname = textName.text().trim()
          cy.log(" THIS IS THE CURRENT CLIENT NAME "+currentclientname)
      })

        //GET the current client email address
      cy.get(clientmodules.clientdashboardtab[1].overviewclientinformation[0].clientsemailaddress)
        .then(cemail=>{
          currentclientemailaddress = cemail.text();
          cy.log(currentclientemailaddress)
        })
           
        //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

        //go to credit notes tab
      cy.click_link_button(clientmodules.billingtab[3].creditnotestablink).wait(2000)
        
      ///// CREATE CREDIT NOTE REQUEST STARTS HERE ///////
        //click the Create Credit button
      cy.click_link_button(clientmodules.billingtab[3].creditrequestmodal[0].createcreditbutton)
        .wait(2000)

        //enter credit note name
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].creditnotenameinputfield, 'Credit Note Request Number 1')
        .wait(2000)

        //enter description
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].descriptiontextareafield, 'This description is for testing purposes only.')
        .wait(2000)

        //enter Requester Note
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].requesternotetextareafield, 'This requester note is for testing purposes only.')
        .wait(2000)

        //enter credit amount 
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].creditrequestamountinputfield, '600')
        .wait(2000)

        //click the submit button
      cy.click_link_button(clientmodules.billingtab[3].creditrequestmodal[0].submitbutton)
        .wait(3000)

        //verify alert-error text message 
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Your credit note request has been sent for approval')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Credit note request created.')
      cy.wait(5000)
      ///// CREATE CREDIT NOTE REQUEST ENDS HERE ///////
   
        //logout as account specialist
        //click the user account profile 
      cy.click_link_button(accountprofilesettingslocator.useraccountprofilepicinitial)
        
        //click the sign out link text
      cy.click_link_button(accountprofilesettingslocator.signoutlinktext)
        .wait(3000)
            
        //login as the Project Manager
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)

        //Click Billing nav module
      cy.click_link_button(clientmodulesnavlink.billingnavlink)
        .wait(1000)

        //now click the Credit Notes link text folder
      cy.click_link_button(billingmodule.CreditNotes[0].creditnoteslinktextfolder)
        .wait(2000)

        //in here I will always select the row 1 in the Awaiting Approval Tab
        
        //i will get the credit note name first in column 1 and store it in a variable
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .should('exist')
        .and('be.visible')
        .then((txt)=>{
          creditNoteName = txt.text().trim();
        })

        //i will click its review button
      cy.click_link_button('table > tbody > tr:first-child > td > button')
        .wait(2000)

        //verify that the Credit Request modal popup open
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].modal)
        .should('exist')
        .and('be.visible')
        
        //verify modal title
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].modaltitle)
        .should('exist')
        .and('be.visible')
        .and('have.text', ' Credit Note Request')
        .and('have.css', 'font-weight', '700')  //font bold 

        //verify Client name and its label     
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].clientnameandlabel)
        .should('exist')
        .and('be.visible')
        .find('label').should('have.text', 'Client')
        .then(()=>{
          cy.get('form > div > div:nth-child(1) > p')
            .should('exist')
            .and('be.visible')
            .then((txt)=>{
               expect(txt.text().trim()).to.equal(currentclientname)
            })
        })

        //verify Credit note name label and the user-inputed Credit Note Name
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].creditnotenameandlabel)
        .should('exist')
        .and('be.visible')
        .find('label').should('have.text', 'Name')
        .then(()=>{
          cy.get('form > div > div:nth-child(2) > p')
            .should('exist')
            .and('be.visible')
            .then((txt)=>{
              expect(txt.text().trim()).to.equal(creditNoteName)
            })
        })

        //verify Description label and the user-inputted description 
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].descriptionandlabel)
        .should('exist')
        .and('be.visible')
        .find('label').should('have.text', 'Description')
        .then(()=>{
          cy.get('form > div > div:nth-child(3) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'This description is for testing purposes only.')
        })

        //verify Requester Note label and the user-inputted requester note
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].requesternoteandlabel)
        .should('exist')
        .and('be.visible')
        .find('label').should('have.text', 'Requester Note')
        .then(()=>{
          cy.get('form > div > div:nth-child(4) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'This requester note is for testing purposes only.')
        })

        //verify Amount label and the user-inputted amount
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].amountandlabel)
        .should('exist')
        .and('be.visible')
        .find('label').should('have.text', 'Amount')
        .then(()=>{
          cy.get('form > div > div:nth-child(5) > div > span')
            .should('exist')
            .and('be.visible')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 600.00')
            })
        })

        //verify there is Apply to Next month invoice label and its check box
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].ApplytonextmonthsinvoicecheckboxandLabel)
        .should('exist')
        .and('be.visible')
        .and('have.text', "Apply to next month's invoice")
        .find('input').should('exist').and('be.visible').and('not.be.disabled').and('have.value', 'false')  //by default uncheck


        //I will verify if a certain element should exist then another set of elements should be visble and it means the client has invoice
        //else the client has no pending invoice
      cy.get('form > div > div:nth-child(6) > div:nth-child(2) > h4')
        .should('exist')
        .and('be.visible')
        .then((titletxt)=>{
          const txt = titletxt.text().trim();
          if(txt === "Client's Open Invoice"){
            //verify please select open invoices
            cy.get('form > div > div:nth-child(6) > div:nth-child(2) > label')
              .should('exist')
              .and('be.visible')
              .and('have.text', 'Please select the open invoices where you would like to apply the credit amount.')
            //verify Remaining Credits label
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(1) > label')
              .should('exist')
              .and('have.text', 'Remaining Credits:')
            //verify the remaining credits amount
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(1) > p')
              .should('exist')
              .then((txt)=>{
                expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 600.00')
              })
            //verify Credits Applied label
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(2) > label')
              .should('exist')
              .and('have.text', 'Credits Applied:')
            //verify Credits Applied default amount which is zero
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(2) > p')
              .should('exist')
              .then((txt)=>{
                expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 0.00')
              })
          } else{
            //verify No Open Invoices title
            cy.get('form > div > div:nth-child(6) > div:nth-child(2) > label')
              .should('exist')
              .and('be.visible')
              .and('have.text', 'No open invoices available')
            //Verify Credits to Apply label and the default value which is zero
            cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].creditstoapplyandlabel)
            .should('exist')
            .and('be.visible')
            .find('label').should('have.text', 'Credits To Apply:')
            .then(()=>{
              cy.get('form > div > div:nth-child(6) > div:nth-child(2) > div > div:nth-child(2) > p')
                .should('exist')
                .and('be.visible')
                .then((txt)=>{
                  expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 0.00') //default value
                })
            })
          } // END IF
        })
        
        //now user will tick the checkbox for Apply to Next month invoice
      cy.get('form > div > div:nth-child(6) > div:nth-child(1) > label > span > input')
        .click()
        .wait(2000)
        .should('have.value', 'true')
        .then(()=>{
          //verify apply max amount elements will emerge
          cy.get('form > div > div:nth-child(6) > div > div.text-center')
            .should('exist')
            .and('be.visible')
            .then(()=>{
              //verify dollar symbol
              cy.get('form > div > div:nth-child(6) > div > div.text-center > div > span')
                .should('exist')
                .and('be.visible')
                .and('have.text', '$')
              //verify input field
              cy.get('form > div > div:nth-child(6) > div > div.text-center > div > input')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .and('have.value', '0') //default value
              //verify Apply max amount button
              cy.get('form > div > div:nth-child(6) > div > div.text-center > button')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .and('have.text', 'Apply max amount')
            })
        })

        //if user click the Apply max button, the total amount should be inputted in the input field as the max amount 
      cy.get('form > div > div:nth-child(6) > div > div.text-center > button').click().wait(2000)

        //verify on the input field if it carry the total amount
      cy.get('form > div > div:nth-child(6) > div > div.text-center > div > input')
        .should('have.value', '600')

        //and the credits applied input field also should reflect the max amount
      cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(2) > p').then((txt)=>{
        expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 600.00') //the max amount
      })
      
        //verify Deny button
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].denybutton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Deny')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(195, 0, 0)')  //background color that forms like a capsule
        .and('have.css', 'border-radius', '9999px') //the curve edge

        //verify Approve button
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].approvebutton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(0, 150, 109)')  //background color that forms like a capsule
        .and('have.css', 'border-radius', '9999px') //the curve edg

        //click the Approve button
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].approvebutton).scrollIntoView()
        .click()
        .wait(3000)

        //verify another modal should popup
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].modal)
        .should('exist')
        .and('be.visible')

        //verify modal title Are you sure you want to apply this credit amount of $?
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].modaltitle)
        .should('exist')
        .and('be.visible')
        .and('contain', 'Are you sure you want to apply this credit amount of $')
        .and('have.css', 'font-weight', '700')

        //verify Auto-apply to next month's invoice text
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].Autoapplytonextmonthsinvoice)
        .should('exist')
        .and('be.visible')
        .and('contain', "Auto-apply to next month's invoice")
        .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(0, 186, 136)')
        .then(()=>{
          //verify dollar sign
          cy.get('div.text-grayscale-700 > div.text-left > div > span:nth-child(3)')
            .should('exist')
            .and('be.visible')
            .and('have.text', '$')
          //verify the total max amount
          cy.get('div.text-grayscale-700 > div.text-left > div > span:nth-child(4)')
            .should('exist')
            .and('be.visible')
            .and('have.text', '600')
        })

        //verify If you click Approve....
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].IfyouclickApprove)
        .should('exist')
        .and('be.visible')
        .find('span').should('have.css', 'color', 'rgb(0, 150, 109)') // the word Approve is in green text color
        .then(()=>{
          cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].IfyouclickApprove).then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('If you click Approve, the credit amount will be automatically applied to the selected invoice(s) and the partner will receive a notification about the changes')
          }) 
        })
        
        //verify cancel button
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].cancelbutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(148, 148, 148)')  //text color
        .and('have.css', 'font-weight', '700')  //font bold

        //verify approve button
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].approvebutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'color', 'rgb(255, 255, 255)')  //text color
        .and('have.css', 'background-color', 'rgb(16, 185, 129)') // background color that form like a capsule
        .and('have.css', 'border-radius', '9999px')
        .and('have.css', 'font-weight', '700')  //font bold

        //click the approve button
      cy.click_link_button(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].approvebutton)
        .wait(2000)

        
        //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Success')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Credit note saved to zoho')
        
      cy.wait(5000)
        //go to Billing > Credit Notes > Approve tab
      cy.click_link_button('div > nav[aria-label="Tabs"] > button:nth-child(2)')
        .wait(2000)

      ////// BILLING > CREDIT NOTES > APPROVED TAB TABLE LIST STARTS HERE //////////

      cy.get('table > tbody > tr:first-child').within(()=>{
          //assert column 1 > Credit Note Name
        billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Credit Note Request Number 1')
          //assert column 2 > Client Name
        billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', currentclientname)
          //assert column 3 > CN #
        billingUpsells.verifyrow1column3CN(' > td:nth-child(3)', 'CN-')
          //then get the cn number and store it in a variable
        cy.get(' > td:nth-child(3)')
          .then((txt)=>{
            cnNumber = txt.text().trim();
          })
          //assert column 4 > Balance 
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(4) > span', '$ 600.00')
          //assert column 5 > Auto Apply
        billingUpsells.verifyrow1column3Amount(' > td:nth-child(5) > span', '$ 600.00')
        cy.get(' > td:nth-child(5) > span')
          .should('have.css', 'color', 'rgb(0, 186, 136)')  //text color
          //assert column 6 > Status
        billingUpsells.verifyrow1column4Status(' > td:nth-child(6) > span ', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
          //assert column 7 > Request Date / Submitted Date
        billingUpsells.verifyrow1column5Date(' > td:nth-child(7) > span ', utilfunc.getFormattedDate())
          //assert column 8 > Submitted By
        billingUpsells.verifyrow1column8Submittedby(' > td:nth-child(8) > div', 'luffymonkey')
          //assert column 9 > Updated By
        billingUpsells.verifyrow1column9Approver(' > td:nth-child(9) > div', 'AK', 'AdmiralKizaru')
          //assert column 10 > Action > View
        billingUpsells.verifyrow1column9Action(' > td:nth-child(10) > button', 'not.be.disabled', 'View')
      })
      ////// BILLING > CREDIT NOTES > APPROVED TAB TABLE LIST ENDS HERE //////////

        //click the view button
      cy.click_link_button('table > tbody > tr:first-child > td:nth-child(10) > button')
        .wait(2000)

        //Credit Note Request modal popup
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].modal)
        .should('exist')
        .and('be.visible')

        //verify that in the modal there is now Zoho Credit Note label and its CN#
      cy.get('form > div.flex > div:nth-child(6)')
        .should('exist')
        .and('be.visible')
        .find('label').should('exist').and('be.visible').and('have.text', 'Zoho Credit Note')
        .then(()=>{
          //verify the cn number
          cy.get('form > div.flex > div:nth-child(6) > div > span')
            .should('exist')
            .and('be.visible')
            .then((txt)=>{
              expect(txt.text().trim()).to.equal(cnNumber)
            })
          //verify view PDF button
          cy.get('form > div.flex > div:nth-child(6) > div  > button[title="View PDF"]')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled')
          //verify download PDF
          cy.get('form > div.flex > div:nth-child(6) > div  > button[title="Download PDF"]')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled')
        })

        //click the x button to close the modal
      cy.click_link_button('div.opacity-100 > div.inline-block > div > div > button')
        .wait(2000)
          
        //go to the client profile page > billing > Credit Notes > table
        //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

        //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)
      
        //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

        //go to credit notes tab
      cy.click_link_button(clientmodules.billingtab[3].creditnotestablink).wait(2000)
          
      //// CLIENT > BILLING > CREDIT NOTES TAB TABLE ASERTIONS STARTS HERE //////////

      cy.get('table > tbody > tr:first-child').within(()=>{
          //assert column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
          //assert column 6 > Updated By
        tablelist.verifyrow1column6UpdatedbyExpectedName(' > td:nth-child(6) > div', 'AdmiralKizaru')
      })

      //// CLIENT > BILLING > CREDIT NOTES TAB TABLE ASERTIONS ENDS HERE //////////

        //I will click the view button
      cy.click_link_button('table > tbody > tr:first-child > td > button')
        .wait(2000)

        //credit note request modal popup open
      cy.get(clientmodules.billingtab[3].creditrequestmodal[0].modal)
        .should('exist')
        .and('be.visible')

        //verify that the zoho is also visible
      cy.get('form > div > div:nth-child(6)')
        .should('exist')
        .and('be.visible')
        .find('label').should('exist').and('be.visible').and('have.text', 'Zoho Credit Note')
        .then(()=>{
          //verify the cn number
          cy.get('form > div > div:nth-child(6) > div > span')
            .should('exist')
            .and('be.visible')
            .then((txt)=>{
              expect(txt.text().trim()).to.equal(cnNumber)
            })
          //verify View PDF button
          cy.get('form > div > div:nth-child(6) > div > button[title="View PDF"]')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled')
          //verify Download PDF
          cy.get('form > div > div:nth-child(6) > div > button[title="Download PDF"]')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled')
        })

        //verify Apply to next month's invoice
      cy.get('form > div > div:nth-child(7) > div > label > span')
        .should('exist')
        .and('be.visible')
        .and('contain', "Apply to next month's invoice")
        .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(0, 186, 136)')
        .then(()=>{
          //the amount
          cy.get('form > div > div:nth-child(7) > div > label > span > span')
            .should('exist')
            .and('be.visible')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 600.00')
            })
        }) 
    })
    it.skip("Testcase ID: CCCR0007 - Apply to Next Month Invoice [Enter partial Credit amount]",()=>{
      let currentclientname;
      let currentclientemailaddress;
      let creditNoteName;
      let cnNumber;

        //calling utility functions
      const utilfunc = new utilityfunctions();

        //calling billing_upsells
      const billingUpsells = new billingupsells();

        //calling client_billing_upsells_tablelist
      const tablelist = new upsellstablelist();
       
        //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
          
        //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

        //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)
      
        //GET current client name as the H1 title
      cy.get(clientmodules.testclientpagemaintitle).then((textName)=>{
          currentclientname = textName.text().trim()
          cy.log(" THIS IS THE CURRENT CLIENT NAME "+currentclientname)
      })

        //GET the current client email address
      cy.get(clientmodules.clientdashboardtab[1].overviewclientinformation[0].clientsemailaddress)
        .then(cemail=>{
          currentclientemailaddress = cemail.text();
          cy.log(currentclientemailaddress)
        })
           
        //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

        //go to credit notes tab
      cy.click_link_button(clientmodules.billingtab[3].creditnotestablink).wait(2000)
        
      ///// CREATE CREDIT NOTE REQUEST STARTS HERE ///////
        //click the Create Credit button
      cy.click_link_button(clientmodules.billingtab[3].creditrequestmodal[0].createcreditbutton)
        .wait(2000)

        //enter credit note name
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].creditnotenameinputfield, 'Credit Note Request Number 2')
        .wait(2000)

        //enter description
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].descriptiontextareafield, 'This description is for testing purposes only.')
        .wait(2000)

        //enter Requester Note
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].requesternotetextareafield, 'This requester note is for testing purposes only.')
        .wait(2000)

        //enter credit amount 
      cy.type_enter_data(clientmodules.billingtab[3].creditrequestmodal[0].creditrequestamountinputfield, '500')
        .wait(2000)

        //click the submit button
      cy.click_link_button(clientmodules.billingtab[3].creditrequestmodal[0].submitbutton)
        .wait(3000)

        //verify alert-error text message 
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Your credit note request has been sent for approval')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Credit note request created.')
      cy.wait(5000)
      ///// CREATE CREDIT NOTE REQUEST ENDS HERE ///////
   
        //logout as account specialist
        //click the user account profile 
      cy.click_link_button(accountprofilesettingslocator.useraccountprofilepicinitial)
        
        //click the sign out link text
      cy.click_link_button(accountprofilesettingslocator.signoutlinktext)
        .wait(3000)
            
        //login as the Project Manager
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.projectmanager, useraccountdata.accountspecialistandprojectmanagerpassword)

        //Click Billing nav module
      cy.click_link_button(clientmodulesnavlink.billingnavlink)
        .wait(1000)

        //now click the Credit Notes link text folder
      cy.click_link_button(billingmodule.CreditNotes[0].creditnoteslinktextfolder)
        .wait(2000)

        //in here I will always select the row 1 in the Awaiting Approval Tab
        
        //i will get the credit note name first in column 1 and store it in a variable
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .should('exist')
        .and('be.visible')
        .then((txt)=>{
          creditNoteName = txt.text().trim();
        })

        //i will click its review button
      cy.click_link_button('table > tbody > tr:first-child > td > button')
        .wait(2000)

        //verify that the Credit Request modal popup open
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].modal)
        .should('exist')
        .and('be.visible')
        
        //I will verify if a certain element should exist then another set of elements should be visble and it means the client has invoice
        //else the client has no pending invoice
      cy.get('form > div > div:nth-child(6) > div:nth-child(2) > h4')
        .should('exist')
        .and('be.visible')
        .then((titletxt)=>{
          const txt = titletxt.text().trim();
          if(txt === "Client's Open Invoice"){
            //verify please select open invoices
            cy.get('form > div > div:nth-child(6) > div:nth-child(2) > label')
              .should('exist')
              .and('be.visible')
              .and('have.text', 'Please select the open invoices where you would like to apply the credit amount.')
            //verify Remaining Credits label
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(1) > label')
              .should('exist')
              .and('have.text', 'Remaining Credits:')
            //verify the remaining credits amount
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(1) > p')
              .should('exist')
              .then((txt)=>{
                expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 500.00')
              })
            //verify Credits Applied label
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(2) > label')
              .should('exist')
              .and('have.text', 'Credits Applied:')
            //verify Credits Applied default amount which is zero
            cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(2) > p')
              .should('exist')
              .then((txt)=>{
                expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 0.00')
              })
          } else{
            //verify No Open Invoices title
            cy.get('form > div > div:nth-child(6) > div:nth-child(2) > label')
              .should('exist')
              .and('be.visible')
              .and('have.text', 'No open invoices available')
            //Verify Credits to Apply label and the default value which is zero
            cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].creditstoapplyandlabel)
            .should('exist')
            .and('be.visible')
            .find('label').should('have.text', 'Credits To Apply:')
            .then(()=>{
              cy.get('form > div > div:nth-child(6) > div:nth-child(2) > div > div:nth-child(2) > p')
                .should('exist')
                .and('be.visible')
                .then((txt)=>{
                  expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 0.00') //default value
                })
            })
          } // END IF
        })
        
        //now user will tick the checkbox for Apply to Next month invoice
      cy.get('form > div > div:nth-child(6) > div:nth-child(1) > label > span > input')
        .click()
        .wait(2000)
        .should('have.value', 'true')
        .then(()=>{
          //verify apply max amount elements will emerge
          cy.get('form > div > div:nth-child(6) > div > div.text-center')
            .should('exist')
            .and('be.visible')
            .then(()=>{
              //verify dollar symbol
              cy.get('form > div > div:nth-child(6) > div > div.text-center > div > span')
                .should('exist')
                .and('be.visible')
                .and('have.text', '$')
              //verify input field
              cy.get('form > div > div:nth-child(6) > div > div.text-center > div > input')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .and('have.value', '0') //default value
              //verify Apply max amount button
              cy.get('form > div > div:nth-child(6) > div > div.text-center > button')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .and('have.text', 'Apply max amount')
            })
        })

        //here is where i enter an amount less than the total credit amount
      cy.type_enter_data('form > div > div:nth-child(6) > div > div.text-center > div > input', '300')
      
        //verify on the input field if it carry the total amount
      cy.get('form > div > div:nth-child(6) > div > div.text-center > div > input')
        .should('have.value', '300')

        //i need to click here to update
      cy.get('form > div > div:nth-child(6) > div:nth-child(2) > h4').click().wait(1000)

        //and the credits applied input field also should reflect the max amount
      cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(2) > p').then((txt)=>{
        expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 300.00') //the max amount
      })

        //as well as the Remaining Credits should be 200
      cy.get('form > div > div:nth-child(6) > div:nth-child(3) > div:nth-child(1) > p').then((txt)=>{
        expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 200.00') //the remaining or balance amount
      })
      
        //click the Approve button
      cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].approvebutton).scrollIntoView()
        .click()
        .wait(3000)

        //verify another modal should popup
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].modal)
        .should('exist')
        .and('be.visible')

        //verify Auto-apply to next month's invoice text
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].Autoapplytonextmonthsinvoice)
        .should('exist')
        .and('be.visible')
        .and('contain', "Auto-apply to next month's invoice")
        .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(0, 186, 136)')
        .then(()=>{
          //verify dollar sign
          cy.get('div.text-grayscale-700 > div.text-left > div > span:nth-child(3)')
            .should('exist')
            .and('be.visible')
            .and('have.text', '$')
          //verify the total max amount
          cy.get('div.text-grayscale-700 > div.text-left > div > span:nth-child(4)')
            .should('exist')
            .and('be.visible')
            .and('have.text', '300')
        })

        //verify If you click Approve....
      cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].IfyouclickApprove)
        .should('exist')
        .and('be.visible')
        .find('span').should('have.css', 'color', 'rgb(0, 150, 109)') // the word Approve is in green text color
        .then(()=>{
          cy.get(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].IfyouclickApprove).then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('If you click Approve, the credit amount will be automatically applied to the selected invoice(s) and the partner will receive a notification about the changes')
          }) 
        })
        
        //click the approve button
      cy.click_link_button(billingmodule.CreditNotes[0].Areyousureyouwanttoapplythiscreditamountof[0].approvebutton)
        .wait(2000)

        //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Success')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Credit note saved to zoho')
        
      cy.wait(5000)
        //go to Billing > Credit Notes > Approve tab
      cy.click_link_button('div > nav[aria-label="Tabs"] > button:nth-child(2)')
        .wait(2000)

        ////// BILLING > CREDIT NOTES > APPROVED TAB TABLE LIST STARTS HERE //////////

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column 1 > Credit Note Name
      billingUpsells.verifyrow1column1Servicename(' > td:nth-child(1) > a', 'Credit Note Request Number 2')
        //assert column 2 > Client Name
      billingUpsells.verifyrow1column2Clientname(' > td:nth-child(2) > a', currentclientname)
        //assert column 3 > CN #
      billingUpsells.verifyrow1column3CN(' > td:nth-child(3)', 'CN-')
        //then get the cn number and store it in a variable
      cy.get(' > td:nth-child(3)')
        .then((txt)=>{
          cnNumber = txt.text().trim();
        })
        //assert column 4 > Balance 
      billingUpsells.verifyrow1column3Amount(' > td:nth-child(4) > span', '$ 500.00')
        //assert column 5 > Auto Apply
      billingUpsells.verifyrow1column3Amount(' > td:nth-child(5) > span', '$ 300.00')
      cy.get(' > td:nth-child(5) > span')
        .should('have.css', 'color', 'rgb(0, 186, 136)')  //text color
        //assert column 6 > Status
      billingUpsells.verifyrow1column4Status(' > td:nth-child(6) > span ', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
        //assert column 7 > Request Date / Submitted Date
      billingUpsells.verifyrow1column5Date(' > td:nth-child(7) > span ', utilfunc.getFormattedDate())
        //assert column 8 > Submitted By
      billingUpsells.verifyrow1column8Submittedby(' > td:nth-child(8) > div', 'luffymonkey')
        //assert column 9 > Updated By
      billingUpsells.verifyrow1column9Approver(' > td:nth-child(9) > div', 'AK', 'AdmiralKizaru')
        //assert column 10 > Action > View
      billingUpsells.verifyrow1column9Action(' > td:nth-child(10) > button', 'not.be.disabled', 'View')
    })
    ////// BILLING > CREDIT NOTES > APPROVED TAB TABLE LIST ENDS HERE //////////

      //click the view button
    cy.click_link_button('table > tbody > tr:first-child > td:nth-child(10) > button')
      .wait(2000)

      //Credit Note Request modal popup
    cy.get(billingmodule.CreditNotes[0].creditnoterequestmodal[0].modal)
      .should('exist')
      .and('be.visible')

      //verify that in the modal there is now Zoho Credit Note label and its CN#
    cy.get('form > div.flex > div:nth-child(6)')
      .should('exist')
      .and('be.visible')
      .find('label').should('exist').and('be.visible').and('have.text', 'Zoho Credit Note')
      .then(()=>{
        //verify the cn number
        cy.get('form > div.flex > div:nth-child(6) > div > span')
          .should('exist')
          .and('be.visible')
          .then((txt)=>{
            expect(txt.text().trim()).to.equal(cnNumber)
          })
        //verify view PDF button
        cy.get('form > div.flex > div:nth-child(6) > div  > button[title="View PDF"]')
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
        //verify download PDF
        cy.get('form > div.flex > div:nth-child(6) > div  > button[title="Download PDF"]')
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
      })

      //click the x button to close the modal
    cy.click_link_button('div.opacity-100 > div.inline-block > div > div > button')
      .wait(2000)
        
      //go to the client profile page > billing > Credit Notes > table
      //click the Client module nav link
    cy.click_link_button(clientmodulesnavlink.clientsnavlink)
      .wait(3000)

      //click the first top client test in the active client listing AAAROO TEST
    cy.click_link_button(clientmodules.testclient)
      .wait(2000)
    
      //click the billing tab
    cy.click_link_button(clientmodules.billingtab[0].billingtablink)
      .wait(1000)

      //go to credit notes tab
    cy.click_link_button(clientmodules.billingtab[3].creditnotestablink).wait(2000)
        
    //// CLIENT > BILLING > CREDIT NOTES TAB TABLE ASERTIONS STARTS HERE //////////

    cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column 4 > Status
      tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'approved', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
        //assert column 6 > Updated By
      tablelist.verifyrow1column6UpdatedbyExpectedName(' > td:nth-child(6) > div', 'AdmiralKizaru')
    })

    //// CLIENT > BILLING > CREDIT NOTES TAB TABLE ASERTIONS ENDS HERE //////////

      //I will click the view button
    cy.click_link_button('table > tbody > tr:first-child > td > button')
      .wait(2000)

      //credit note request modal popup open
    cy.get(clientmodules.billingtab[3].creditrequestmodal[0].modal)
      .should('exist')
      .and('be.visible')

      //verify that the zoho is also visible
    cy.get('form > div > div:nth-child(6)')
      .should('exist')
      .and('be.visible')
      .find('label').should('exist').and('be.visible').and('have.text', 'Zoho Credit Note')
      .then(()=>{
        //verify the cn number
        cy.get('form > div > div:nth-child(6) > div > span')
          .should('exist')
          .and('be.visible')
          .then((txt)=>{
            expect(txt.text().trim()).to.equal(cnNumber)
          })
        //verify View PDF button
        cy.get('form > div > div:nth-child(6) > div > button[title="View PDF"]')
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
        //verify Download PDF
        cy.get('form > div > div:nth-child(6) > div > button[title="Download PDF"]')
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
      })

      //verify Apply to next month's invoice
    cy.get('form > div > div:nth-child(7) > div > label > span')
      .should('exist')
      .and('be.visible')
      .and('contain', "Apply to next month's invoice")
      .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(0, 186, 136)')
      .then(()=>{
        //the amount
        cy.get('form > div > div:nth-child(7) > div > label > span > span')
          .should('exist')
          .and('be.visible')
          .then((txt)=>{
            expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('$ 300.00')
          })
      }) 
    })
    // **** CLIENT CREDIT NOTE ENDS HERE ***
    // **** CLIENT BILLING SUBSCRIPTIONS PAYMENT METHOD CARD STARTS HERE ***
    it.skip("Testcase ID: CBS0001 - Verify user can Add New Card Number at the Billing > Subscriptions > Payment Methods [Braintree processed]",()=>{
         
        
        //login using admin role account
        cy.userloginaccount(loginpagelocatorsdata.emailaddressinputfield, loginpagelocatorsdata.passwordinputfield, loginpagelocatorsdata.signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

        //click the first top client test in the active client listing AAAROO
        cy.click_link_button(activeclientpagelocatorsdata.aaarootestactiveclient)
        cy.wait(2000)

        //click the billing tab
        cy.click_link_button_xpathlocator(clientbillingpagedata.billingtablink)
        .wait(3000)

        //verify in here that when you click the billing tab the default focus sub tab is the Subscription tab
        //it will be identified as the title becomes in bold red color signifying that it is by default selected or visit
        //then you will find also that there is a title called Overview   
        cy.get(billingsubscriptiondata.Subscriptionstab)
        .should('have.css', 'color', 'rgb(239, 68, 68)') //font color
        .and('have.css', 'font-weight', '600') //font bold
        .and('be.visible')
        .and('exist')

        //verify title in the Subscriptions tab
        cy.get(billingsubscriptiondata.overviewtitle)
        .should('have.css', 'font-weight', '700') //font bold
        .and('be.visible')
        .and('exist')

        //This test client is created as a brain tree payment process
        //verify the payment methods title
        cy.get(billingsubscriptiondata.paymentmethodstitle)
        .should('have.css', 'font-weight', '700') //font bold
        .and('be.visible')
        .and('exist')
        .and('contain', 'Payment Methods')

        //verify add new button
        cy.get(billingsubscriptiondata.addnewbutton)
        .should('have.css', 'color', 'rgb(250, 250, 250)') //font color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') // color of the capsule-like background
        .and('have.css', 'border-radius', '40px') //the curve edge
        .and('have.css', 'width', '114.359375px')
        .and('have.css', 'height', '39.5px')
        .and('be.visible')
        .and('exist')
        .and('not.have.attr', 'disabled')

        //click the add new button
        cy.click_link_button(billingsubscriptiondata.addnewbutton)
        cy.wait(1000)

        //verify that the Add new payment method popup
        cy.get(billingsubscriptiondata.addnewpaymentmethodmodal)
        .should('be.visible')
        .and('exist')

        //verify the add new payment modal title
        cy.get(billingsubscriptiondata.addnewpaymentmethodmodaltitle)
        .should('have.css', 'font-weight', '700') //font bold
        .and('be.visible')
        .and('exist')
        .and('contain', 'Add new Payment Method')

        //verify card number input field label
        cy.get(billingsubscriptiondata.addnewpaymentmethodmodalcardnumberinputfieldlabel)
        .should('be.visible')
        .and('exist')
        .and('contain', 'Card Number')

        //verify card number input field 
       cy.get(billingsubscriptiondata.addnewpaymentmethodmodalcardnumberinputfield)
        .should('be.visible')
        .and('exist')
        .and('not.have.attr', 'disabled')
        //since the input field of the card number is in iframe so trying to get the exact iframe input field 
     

        //////////////////////////////////////////////////////////////////////

          function getStripeField({iframeSelector, fieldSelector}, attempts = 0) {
            Cypress.log({displayName: 'getCardField', message: `${fieldSelector}: ${attempts}`})
          
            if (attempts > 50) throw new Error('too many attempts')
          
            return cy.get(iframeSelector, {timeout:10_000, log:false})
              .eq(0, {log:false})
              .its('0.contentDocument', {log:false}) 
              .find('body', {log:false})
              .then(body => {
                cy.wait(10000)
                const stripeField = body.find(fieldSelector)
                if (!stripeField.length) {
                  return cy.wait(300, {log:false})
                    .then(() => {
                      getStripeField({iframeSelector, fieldSelector}, ++attempts)
                    })
                } else {
                  return cy.wrap(stripeField)
                }
              })
          }

          getStripeField({
            iframeSelector: '#braintree-hosted-field-number', 
            fieldSelector: '#credit-card-number'
          })
          .should('have.value', '4242 4242 4242 4242').should('be.visible')
        //////////////////////////////////////////////////////////////////////        
    })
    it("Testcase ID: CBS0004 - Verify user can do Charge One-Time Addon feature",()=>{


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //verify the kebab menu buton in the Billing > Subscriptions page - next to Edit button
      //if found, then click
      cy.get(clientmoduledata.cssSelectors[0].OneTime_Subcription_kebabMenuButton)
        .should('exist')
        .and('not.be.disabled')
        .click()
        .wait(1000)
   
      //verify the sub menus such as Charge One-Time Addon | One Time Change | Pause Subscription | Cancel Subscription
      //verify the Charge One-Tim Addon and One Time Charge sub menus
      const ChargeOneTimeAddon_and_OneTimeCharge_SubmenuButtons = [
        'Charge One-Time Addon',
        'One Time charge'
      ];
      cy.get('div.ring-opacity-5 > div:nth-child(1) > button').each(($option, index) => {
          cy.wrap($option).should('have.text', ChargeOneTimeAddon_and_OneTimeCharge_SubmenuButtons[index])  //verify names based on the expected names per column
            .should('exist')
            .and('not.be.disabled')
            .realHover()
            .wait(500)
            .should('have.css', 'color', 'rgb(255, 255, 255)') //text color changed as it hovers onto it
            .and('have.css', 'background-color', 'rgb(239, 68, 68)') // background color emerge as it hovers onto it
          cy.log(ChargeOneTimeAddon_and_OneTimeCharge_SubmenuButtons[index]) 
      });

      //verify Pause Subscription and Cancel Subscription sub menus
      const PauseSubscription_and_CancelSubscription_SubmenuButtons = [
        'Pause Subscription',
        'Cancel Subscription'
      ];

      cy.get('div.ring-opacity-5 > div:nth-child(2) > button').each(($option, index) => {
        cy.wrap($option).should('have.text', PauseSubscription_and_CancelSubscription_SubmenuButtons[index])  //verify names based on the expected names per column
          .should('exist')
          .and('not.be.disabled')
          .realHover()
          .wait(500)
          .should('have.css', 'color', 'rgb(255, 255, 255)') //text color changed as it hovers onto it
          .and('have.css', 'background-color', 'rgb(239, 68, 68)') // background color emerge as it hovers onto it
        cy.log(PauseSubscription_and_CancelSubscription_SubmenuButtons[index]) 
      });

      //Then click the Charge On-Time Addon sub menu button
      cy.get('div.ring-opacity-5 > div:nth-child(1) > button')
        .realHover()
        .click()
        .wait(1000)

      //verify Charge One-Time Addon modal popup
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].modal)
        .should('exist')

      //verify modal title
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Charge One-Time Addon')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Addon 1 Label and the Delete icon button
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].Addon1labelandDeletebutton)
        .should('exist')
        .within(()=>{
          //assert Addon1 label
          cy.get('span')
            .should('exist')
            .and('have.text', 'Addon 1')
            .and('have.css', 'font-weight', '700') //font bold
          //assert delete icon button
          cy.get('button')
            .should('exist')
            .and('not.be.disabled')
        })

      //verify Addon Label and the Select Menu Drop down menu
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].AddonLabelandSelectMenu)
        .should('exist')
        .within(()=>{
          //assert Addon label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Addon *')
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
          //assert Addon Select drop down menu
          cy.get('select[name="addons.0.addon_code"]')
            .should('exist')
            .and('not.be.disabled')
            .find('option').should('have.length.gt', 0) //Since the list is not static and it can be added and/or remove, but it should have at least minimum of 1
        })

      //verify Type Label and One_Time text
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].TypeLabelandOne_Time)
        .should('exist')
        .within(()=>{
          //assert Type Label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Type')
          //assert One_Time text
          cy.get('div')
            .should('exist')
            .and('have.text', 'one_time')
            .and('have.css', 'text-transform', 'capitalize')
        })

      //verify Qty label and Input field
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].QtyLabelandInputfield)
        .should('exist')
        .within(()=>{
          //assert Qty Label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Qty')
          //assert Qty input field
          cy.get('input[name="addons.0.quantity"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '1')
        })

      //verify Price label and Input field
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].PriceLabelandInputfield)
        .should('exist')
        .within(()=>{
          //assert Price label
          cy.get('label')
            .should('exist')
            .and('contain', 'Price')
          //assert the $ symbol
          cy.get(' > div > div > span')
            .should('exist')
            .and('have.text', '$')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //and then the input field
          cy.get(' > div > input[name="addons.0.price"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '0')
        })

      //verify Total label and value
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].TotalLabelandValue)
        .should('exist')
        .within(()=>{
          //assert Price label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Total')
          //assert $0.00
          cy.get('span')
            .should('exist')
            .and('have.text', '$0.00')
            .and('have.css', 'color', 'rgb(16, 185, 129)') //text color
        })

      //verify Addon Item Description textarea field
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].ItemDescriptiontextareafield)
        .should('exist')
        .within(()=>{
          //assert textarea input field
          cy.get('textarea[name="addons.0.addon_description"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default before selecting an item
            .and('have.attr', 'maxlength', '2000')
          //assert the 0/2000 characters text info
          cy.get(' > div')
            .should('exist')
            .then((txt)=>{
              expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('0/2000 characters')
            })
        })

      //verify +Addon button
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].AddonButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(75, 85, 99)') //text color
        .and('have.css', 'border-color', 'rgb(75, 85, 99)') //border color outline that form a capsule like
        .and('have.css', 'border-radius', '16px')
        .and('have.css', 'font-weight', '700')
        .then((txt)=>{
          expect(txt.text().trim()).to.equal('Addon')
        })

      //verify Cancel button
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'font-weight', '700')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //text color

      //verify Apply button
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].ApplyButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Apply')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(185, 28, 28)') //background color that form like a capsule

      /////// REQUIRED CHARGE ONE-TIME ADDON MODAL ASSERTIONS STARTS HERE /////////////

      //without selecing addon, click the Apply button
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].ApplyButton)
        .click()
        .wait(3000)

      //alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Errors found')
      cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'addon code is required')

      //verify that the modal should remain open
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].modal)
        .should('exist')

      //verify Error text appear inside the modal - addon code is required
      cy.get('form > div > div:nth-child(2) > div')
        .should('exist')
        .and('have.text', 'addon code is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now I will select addon
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].AddonLabelandSelectMenu)
        .find('select[name="addons.0.addon_code"]').select('1604151000000179046').should('have.value', '1604151000000179046')
        .wait(500)

      //verify that after i select an addon item, it goes onto the top
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].AddonLabelandSelectMenu)
        .find('select option:selected')
        .should('have.text', 'Product Images')

      //verify that the Error Text should not visible inside the modal
      cy.get('form > div > div:nth-child(2) > div')
        .should('not.exist')

      //verify the updated Price value
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].PriceLabelandInputfield)
        .find(' > div > input[name="addons.0.price"]')
        .should('have.value', '125.35')
        .and('not.be.disabled')

      //verify the updated Total value
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].TotalLabelandValue)
        .find('span')
        .should('have.text', '$125.35')

      //verify the updated Item description value
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].ItemDescriptiontextareafield)
        .find('textarea[name="addons.0.addon_description"]')
        .should('have.value', 'Product Images')

      /////// REQUIRED CHARGE ONE-TIME ADDON MODAL ASSERTIONS ENDS HERE /////////////

      //To continue, No I am going to click the Apply button
      cy.get(clientmoduledata.cssSelectors[0].ChargeOneTimeAddonModal[0].ApplyButton)
        .click()
        .wait(3000)

      //verify success notification popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Charge successful')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'One-time addon has been purchased successfully.')

      //the reason for this is to avoid if there is a delay in producing an invoice at the billing > invoice history tab - it will not be able to find in time
      //Now as expected it will create an invoice at the Billing > Invoice History
      cy.wait(8000)  
      
      //verify Invoice History Tab, if Found then click
      cy.get(clientmoduledata.cssSelectors[1].InvoiceHistoryPage[0].InvoiceHistoryTabLink)
        .should('exist')
        .and('have.text', ' Invoice History')
        .and("have.css", "color", "rgb(156, 163, 175)") //default text color 
        .and("have.css", "font-weight", "400") //font bold
        .click()
        .wait(700)
        .should("have.css", "color", "rgb(239, 68, 68)") //after it was click it changes the text color
        
      //verify the url expected destination page
      cy.url().should('contain', '/billing/invoicehistory')

      /////// CLIENT > BILLING > INVOICE HISTORY > TABLE LIST ASSERTIONS STARTS HERE ///////////

      //verify first the column Names
      //verify the expected column names
      const expectedColumnNames = [
        'Invoice #',
        'Amount',
        'Balance',
        'Status',
        'Due Date',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', expectedColumnNames[index]) //verify names based on the expected options
          .should('exist')
          .and('have.css', 'font-weight', '700')  //font bold
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          cy.log(expectedColumnNames[index]) 
      });


      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Invoice Number
        tablelist.verifyrow1column2Invoicename(' > td:nth-child(1) > a', 'INV-')
        //assert Column 2 > Amount
        tablelist.verifyrow1column3Amount(' > td:nth-child(2) > span', '$ 125.35')
        //assert Column 3 > Balance
        tablelist.verifyrow1column3Amount(' > td:nth-child(2) > span', '$ 125.35')
        //assert Column 4 > Status
        tablelist.verifyrow1column4Status(' > td:nth-child(4) > span', 'sent', 'rgb(59, 130, 246)', 'rgb(219, 234, 254)')
        //assert Column 5 > Due Date - the Due Date is 5 days from the time the Charge One-Time Addon is submitted
        tablelist.verifyrow1column5Date(' > td:nth-child(5) > span', utilfunc.getFormattedDatePlus5days())
        //assert Column 6 > Action:DownloadPDF | SENT EMAIL | VIEW PDF icons
        tablelist.verifyactioncolumhas3buttons(' > td:nth-child(6) > span') 
      })
      /////// CLIENT > BILLING > INVOICE HISTORY > TABLE LIST ASSERTIONS ENDS HERE ///////////
    
    })  
    it.skip("Testcase ID: CBS0005 - Verify user can Edit description under the Plan & Addon Details",()=>{

      let GETcurrentAddoNDescription;
      let currentAddonDescription;

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //////////  PLAN & ADD ON DETAILS TABLE AND ELEMENTS ASSERTIONS STARTS HERE /////////////
      //verify the PLAN & ADD ON DETAILS TABLE Each Column names
      const ColumnNames = [
        'Plan & Addon Details',
        'Qty',
        'Rate',
        'Tax',
        'Amount'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', ColumnNames[index]) //verify names based on the expected options
            .should('exist')
            .and('have.css', 'font-weight', '700')  //font bold
            .and('have.css', 'text-transform', 'uppercase') //all caps
          cy.log(ColumnNames[index]) 
      });
    
      ///// PLAN & ADDON DETAILS > ROW 1 > TABLE LISTS ASSERTIONS STARTS HERE /////
      
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Row 1 > Column 1 > Addon Description
        cy.get(' > td:nth-child(1)')
          .should('exist')
          .and('contain', 'Agency Subscription') // Addon Description title
          .within(()=>{
            //assert the Addon Description
            cy.get(' > div > div > div:nth-child(1)')
              .should('exist')
              .and('not.have.text', '') // means there is a description regardless of what it is
              .then((txt)=>{
                GETcurrentAddoNDescription = new Promise((resolve)=>{
                  //then i will get the description
                  currentAddonDescription = txt.text().trim();
                  resolve();
                })
                
              })
            //assert Edit Description Link text
            cy.get(' > div > div > div:nth-child(2)')
              .should('exist')
              .and('not.be.disabled')
              .and('have.text', 'Edit Description')
              .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
          })
        //assert Row 1 > Column 2 > Qty
        cy.get(' > td:nth-child(2)')
          .should('exist')
          .and('have.text', '1')
        //assert Row 1 > Column 3 > Rate
        cy.get(' > td:nth-child(3)')
          .should('exist')
          .and('have.text', '$800.00')
        //Assert Row 1 > Column 4 > Tax 
        cy.get(' > td:nth-child(4)')
          .should('exist')
          .and('have.text', '-') //no added tax value since the address is not canada
        //assert Row 1 > Column 5 > Amount
        cy.get(' > td:nth-child(5)')
          .should('exist')
          .and('have.text', '$800.00')
      })

      ///// PLAN & ADDON DETAILS > ROW 1 > TABLE LISTS ASSERTIONS ENDS HERE /////

      //Under still the table there is Sub Total label and the Sub total amount - Then verify
      cy.get('table > tbody > tr:nth-child(2) ')
        .should('exist')
        .within(()=>{
          //assert Sub Total label
          cy.get(' > td:nth-child(1)')
            .should('exist')
            .and('have.text', 'Sub Total')
          //assert Sub Total Amount
          cy.get(' > td:nth-child(2)')
            .should('exist')
            .and('have.text', '$800.00')
        })
    
      //verify No Tax Label and the value
      cy.get('table > tbody > tr:nth-child(3)')
        .should('exist')
          .within(()=>{
            //assert No Tax (0%) label
            cy.get(' > td:nth-child(1)')
              .should('exist')
              .and('have.text', 'No Tax (0%)')
            //assert No Tax (0%) Amount
            cy.get(' > td:nth-child(2)')
              .should('exist')
              .and('have.text', '$0.00')
          })

      //verify TOTAL(USD) label and the total amount
      cy.get('table > tbody > tr:nth-child(4)')
        .should('exist')
          .within(()=>{
            //assert TOTAL(USD) label
            cy.get(' > td:nth-child(1)')
              .should('exist')
              .and('have.text', 'Total (USD)')
              .and('have.css', 'font-weight', '700')  //font bold
            //assert Total Amount
            cy.get(' > td:nth-child(2)')
              .should('exist')
              .and('have.text', '$800.00')
              .and('have.css', 'font-weight', '700')  //font bold
          })
    
      //Now I will click the Edit Description Link text
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)')
        .click()
        .wait(1000)

      //After a user clicks onto the Edit Description link text, the Addon Description becomes a textarea field
      // This is a test description. Please disregard as I will remove it after. -> this is the default addon description
      //verify
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1)')
        .find('textarea')
        .should('exist')
        .then(()=>{
          GETcurrentAddoNDescription.then(()=>{
            cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1)')
            .find('textarea')
            .should('have.value', currentAddonDescription)
          })
        })
      //Then I will edit
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1)')
        .find('textarea')
        .and('not.be.disabled')
        .clear()
        .type("This editted Addon Description is for testing purposes only!")
        .wait(600)
        .should('have.value', 'This editted Addon Description is for testing purposes only!')
        .type('{ctrl}{enter}') //And I will Press {CTRL} + {ENTER} on my keyboard
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'description updated')
      cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Item description has been updated successfully.')

      //Intentionally I will have to wait for 7 seconds then reload the page 
      cy.wait(10000)
      cy.reload()

      //Again verify if the description is updated and from textarea field becomes back to non textarea field
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1) > div:nth-child(1)')
        .should('exist')
        .then((txt)=>{
          expect(txt.text().trim()).to.equal('This editted Addon Description is for testing purposes only!')
        })

    })
   
    it.skip("Testcase ID: CBS0006 - Verify user can delete the added description under the Plan & Addon Details",()=>{

      
      
      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //Now I will click the Edit Description Link text
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)')
        .click()
        .wait(1000)

      //Delete the Entire Description
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1)')
        .find('textarea')
        .clear()
        .type('{ctrl}{enter}') //And I will Press {CTRL} + {ENTER} on my keyboard
        .wait(3000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.authenticationerror, 'description updated')
      cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Item description has been updated successfully.')

      //Intentionally I will have to wait for 7 seconds then reload the page 
      cy.wait(8000)
      cy.reload()
      cy.wait(3000)
      cy.reload()

      //Again verify if the description is updated and from textarea field becomes back to non textarea field
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1) > div:nth-child(1)')
        .should('exist')
        .then((txt)=>{
          expect(txt.text().trim()).to.equal('Add a description') // default text
        })
 
      //verify the Edit Description Link text is now Add Description Link text
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)')
        .should('exist')
        .and('have.text', 'Add Description')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
      
    })
    it.skip("Testcase ID: CBS0007 - Verify user can Add a Subscription Note ",()=>{
      
      //calling utility functions
      const utilfunc = new utilityfunctions();
   
      //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)
    
      //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

      //note section area
      //verify notes label
      cy.get(clientmodules.billingtab[1].notesarea[0].noteslabelsectionarea)
        .should('have.css', 'color', 'rgb(156, 163, 175)') //font text color
        .and('be.visible')
        .and('exist')
        .and('contain', 'NOTES')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //verify Add link text
      cy.get(clientmodules.billingtab[1].notesarea[0].notesareaaddlinktext)
        .should('have.css', 'color', 'rgb(239, 68, 68)') // font text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('be.visible')
        .and('exist')
        .and('not.be.disabled')
        .and('contain', ' Add')

      //click the Add button
      cy.click_link_button(clientmodules.billingtab[1].notesarea[0].notesareaaddlinktext)
        .wait(1000)

      //verify Add note modal popup
      cy.get(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].modal)
        .should('be.visible')
        .and('exist')
      
      ////////// ADD NOTE MODAL ASSERTIONS ELEMENT STARTS HERE ///////////  
      //verify add note modal title
      cy.get(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].addnotemodaltitle)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Add Note')

      //verify add note modal textarea field
      cy.get(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].addnotemodaltextareafield)
        .should('be.visible')
        .and('exist')
        .and('be.empty')
        .and('be.enabled')
        .and('have.value','')

      //verify add note modal save button
      cy.get(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].savebutton)
        .should('have.css', 'color', 'rgb(255, 255, 255)') //font color text
        .and('have.css', 'background-color', 'rgb(239, 68, 68)') //background color / button color
        .and('have.css', 'border-radius', '6px') // the curve of the edge of the button
        .and('have.css', 'width', '47.953125px')
        .and('have.css', 'height', '32px')
        .and('not.be.disabled')
        .and('contain', 'Save')
      
      //verify add note modal cancel link text
      cy.get(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].cancelbutton)
        .should('be.visible')
        .and('exist')
        .and('contain', 'Cancel')
        .and('not.be.disabled')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      ////////// ADD NOTE MODAL ASSERTIONS ELEMENT ENDS HERE /////////// 
      //// REQUIRED FIELD ASSERTION STARTS HERE ////////
      //without adding a note, click the save button
      //as expected, the note modal remains open, and alert-error message popup
      cy.click_link_button(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].savebutton)
        .wait(3000)

      //verify alert-error message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Failed to add note')

      //wait for the alert-error message to close
      cy.wait(5000)
      //// REQUIRED FIELD ASSERTION ENDS HERE ////////
      //------------------------------------//
      // Add note
      cy.type_enter_data(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].addnotemodaltextareafield, 'This is a test note. Please disregard. Thank you.') 
        .wait(1000)
          
      //click the save button
      cy.click_link_button(clientmodules.billingtab[1].notesarea[0].addnotemodal[0].savebutton)
        .wait(2000)
      
      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Note added')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Notes added.')
      //------------------------------------//

      // i forcebly wait for 1 minute and 30 seconds then reload the page
      // this happen because in the staging and test there is a huge delay in updating the page
      cy.wait(90000) 
      cy.reload()
      cy.wait(5000) //giving enough time after the reload of the page

      //verify if it added a new section of note
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].divisionsection).should('exist').then(()=>{
        //assert newly added note icon
        cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].noteicon)
          .should('be.visible')
          .and('exist')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert the newly added note
        cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].newlyaddednote)
          .should('be.visible')
          .and('exist')
          .and('have.text', 'This is a test note. Please disregard. Thank you.')
        //assert the one who created the newly added note
        cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].whocreatedthenewlyaddednote)
          .should('be.visible')
          .and('exist')
          .and('contain', '- Seller Interactive Admin')
          .and('have.css', 'font-style', 'italic')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert the date created on the newly added note
        cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].newlyaddednotedate)
          .should('be.visible')
          .and('exist')
          .and('contain', utilfunc.getFormattedDate()) // as expected because it was created today
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert delete icon on newly added note
        cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].newlyaddedmotedeleteicon)
          .should('be.visible')
          .and('exist')
          .and('not.be.disabled')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
      })
    })
    it.skip("Testcase ID: CBS0009 - Verify user can Delete a Subscription Note ",()=>{

      //calling utility functions
      const utilfunc = new utilityfunctions();
   
      //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //click the first top client test in the active client listing AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)
    
      //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

      //previous test case was to add new note. so in this test case, I am going to delete it
      //find that newly added note and on its delete icon, i will click it
      cy.click_link_button(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].newlyaddedmotedeleteicon)
        .wait(1000)

      //verify delete confirmation dialog popup
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].deleteconfirmationdialog[0].modal)
        .should('be.visible')
        .and('exist')

      ////////// DELETE CONFIRMATION DIALOG POPUP ASSERTIONS ELEMENTS STARTS HERE //////////////////////
      //verify delete confirmation dialog popup modal title
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].deleteconfirmationdialog[0].modaltitle)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Delete Note')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Are you sure you want to delete this note?
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].deleteconfirmationdialog[0].areyousureyouwanttodeletethisnote)
        .should('be.visible')
        .and('exist')
        .and('contain', 'Are you sure you want to delete this note?')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //verify yes button
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].deleteconfirmationdialog[0].yesbutton)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //font color text
        .and('have.css', 'background-color', 'rgb(5, 150, 105)') //background color or the button color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'border-radius', '40px') //the curve of the button on its edge
        .and('not.be.disabled')
        .and('have.text', 'Yes')

      //verify no button
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].deleteconfirmationdialog[0].nobutton)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'font-weight', '700') //font bold
        .and('not.be.disabled')
        .and('have.text', 'No')
      ////////// DELETE CONFIRMATION DIALOG POPUP ASSERTIONS ELEMENTS ENDS HERE //////////////////////
      //I will now click the yes button
      cy.click_link_button(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].deleteconfirmationdialog[0].yesbutton)
        .wait(2000)

      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Note deleted')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'The note has been deleted.')

      // i forcebly wait for 1 minute and 30 seconds then reload the page
      // this happen because in the staging and test there is a huge delay in updating the page
      cy.wait(90000) 
      cy.reload()
      cy.wait(5000) //giving enough time after the reload of the page

      //verify that the entire section of that recently deleted note should be deleted
      cy.get(clientmodules.billingtab[1].notesarea[0].newaddednotesection[0].divisionsection)
        .should('not.exist') // this should be enough since it assert that it is not visible or removed totally in the DOM and therefore it is not also visible in the page
    })
    // **** CLIENT BILLING SUBSCRIPTIONS PAYMENT METHOD  ENDS HERE ***
    // **** CLIENT RATING DASHBOARD STARTS HERE ***
    it("Testcase ID: CRD0001 - Verify user can Add Rate Account Performance",()=>{

      let GETClientName;
      let clientName;

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)
      
      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //verify Rating Dashboard link text folder
      cy.get(linktextfolders.CLIENTmodules[0].RatingDashboard_linktextFolder)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Rating Dashboard')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default text color
        .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(156, 163, 175)') //its star icon verification

      //Click the Rating Dashboard Link text folder
      cy.get(linktextfolders.CLIENTmodules[0].RatingDashboard_linktextFolder)
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') // text color
        .find('svg').should('have.css', 'color', 'rgb(239, 68, 68)') //text color
      
      //verify correct destination page url
      cy.url().should('contain', '/clients/performance-ratings')

      //verify Rating Dashboard Main Title - Partner Rating Dashboard
      cy.get(clientratingdashboard.pagemaintitle)
        .should('exist')
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.text', 'Partner Rating Dashboard')

      //verify Rate Account Performance button
      cy.get(clientratingdashboard.RateAccountPerformanceButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Rate Account Performance')
        .and('have.css', 'color','rgb(250, 250, 250)') // font text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color button 
        .and('have.css', 'border-radius', '40px') //the curve edges of the button
        
      //click the Rate Account Performance button
      cy.get(clientratingdashboard.RateAccountPerformanceButton)
        .click()
        .wait(2000)

      //verify that the Rate Account Performance modal popup
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].modal)
        .should('exist')

      ////////////// RATE ACCOUNT PERFORMANCE MODAL ELEMENT ASSERTIONS STARTS HERE ////////////////
      //verify Rate Account Performance Modal Title 
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].modaltitle)
        .should('exist')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.text', 'Rate Account Performance')

      //verify the Partner's Account Label and the drop down menu
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].PartnersAccountLabelandDropdownmenu)
        .should('exist')
        .within(()=>{
          //assert Partner's Account* Label
          cy.get('label')
            .should('exist')
            .and('have.text', "Partner's Account*")
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') // asterisk text color
          //assert Partner's Account select menu button
          cy.get(' > div > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'aria-expanded', 'false') // before it is click, this is just a button
            .and('have.text', "Select Partner's Account")
          //Click the button - expected to emerge an search input field within and a drop down list of clients available
          cy.get(' > div > div > button')
            .click()
            .wait(1000)
            .should('have.attr', 'aria-expanded', 'true')
          //assert search input field emerge
          cy.get('#email')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') // empty by default
            .and('have.attr', 'placeholder', 'Search')
          //assert a drop down list of available client. regardless of what and how many but there should be at least 1
          cy.get('div.scrollbar-container > ul')
            .should('exist')
            .and('not.be.disabled')
            .within(()=>{
              //assert there should be a list
              cy.get('li').should('have.length.gt', 0)
            })
          //Now clicking back the Partner's Account button should hide the Search input field and the client list
          cy.get(' > div > div > button')
            .click()
            .wait(1000)
            .should('have.attr', 'aria-expanded', 'false')
          //assert search input field should not be visible
          cy.get('#email')
            .should('not.exist')
          //assert the client list also should not be visible
          cy.get('div.scrollbar-container > ul')
            .should('not.exist')
        })

      //verify Type of Review Label and the lists
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].TypeOfReviewLabelandThelists)
        .should('exist')
        .within(()=>{
          //assert the Type of Review label
          cy.get('label')
            .should('exist')
            .and('contain', 'Type of Review*')
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') // asterisk text color
          //assert the lists with each radio button
          //and the expected options
          const TypeOfReviewLists = [
            'Finished Tasks',
            'Missed Meetings',
            'More action needed',
            'Missed deadlines/Delays',
            'Delayed Reporting',
            'Lack of sales growth',
            'Increase in sales',
            'PPC Issues'
          ];
          cy.get(' > div > label').each(($option, index) => {
            cy.wrap($option).should('have.text', TypeOfReviewLists[index]) //verify names based on the expected
              .should('exist')
              .and('not.be.checked')
              .and('not.be.disabled')
            cy.log(TypeOfReviewLists[index])
          })
      })

      //verify Start Rating label and the five star elements
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].StartRatingLabelandThe5StarsElement)
        .should('exist')
        .within(()=>{
          //assert the Star Rating label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Start Rating*')
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') // asterisk text color
          //assert the 5 star elements
          cy.get(' > div > span > span')
            .should('exist')
            .and('have.length', 5)
            .each(($span)=>{
              cy.wrap($span)
                .should('exist')
                .and('not.be.disabled')
                .and('not.be.checked')
            })
        })

      //verify Additional Information Screenshots Label and button
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].AdditionalInformationScreenshotsLabelandButton)
        .should('exist')
        .within(()=>{
          //assert Additional Information Screenshots Label
          cy.get(' > div > label')
            .should('exist')
            .and('have.text', 'Additional Information Screenshots*')
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') // asterisk text color
          //assert Additional Information Screenshots button
          cy.get(' > div > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'Additional Information Screenshots')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '700') //font bold
            .and('have.css', 'border-color', 'rgb(148, 148, 148)')
            .and('have.css', 'border-radius', '40px') //the curve of the edge of the button
        })

      //verify Any additional notes related to this rating?* label and textarea field
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].AnyadditionalNotesRelatedToThisRatingLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert Any additional notes related to this rating?* label
          cy.get('label')
            .should('exist')
            .and('contain', "Any additional notes related to this rating?*")
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') // asterisk text color
          //assert textarea field
          cy.get('textarea[name="information"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
        })

      //verify Cancel Button
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', "Cancel")
        .and('have.css', 'color', 'rgb(24, 121, 216)') //text color
        .and('have.css', 'font-weight', '700') //font bold

      //verify Submit Button
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].SubmitButton)
        .should('exist')
        .and('be.disabled')
        .and('have.text', "Submit")
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(0, 28, 55)') //the button capsule color

      ////////////// RATE ACCOUNT PERFORMANCE MODAL ELEMENT ASSERTIONS ENDS HERE ////////////////

      //Enter Test Client Name (AAAROO) TEST Then click it when it shows up
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].PartnersAccountLabelandDropdownmenu)
        .within(()=>{
          //click the button
          cy.get(' > div > div > button')
            .click()
            .wait(700)
          //Enter the Client test name in the Search Input field
          cy.get('input[type="email"][name="email"]')
            .clear()
            .type('(AAAROO)')
            .wait(2000)
          //Then click the name as it showed up which is the (AAAROO) TEST
          cy.get('ul > li > button')
            .click()
            .wait(700)
        })

      //verify that it appeared on top after it was selected
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].PartnersAccountLabelandDropdownmenu)
        .find(' > div > div > button')
        .then((txt)=>{
          GETClientName.then(()=>{
            expect(txt.text().trim()).to.equal(clientName);
          })
        })

      //verify Type of Review by ticking each radio button for each of the list
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].TypeOfReviewLabelandThelists)
        .find(' > div > label > input')
        .each(($input) => {
          cy.wrap($input).check()
            .wait(700)
            .should('be.checked')
        })
      
      //Then I will select the first
      cy.get('form > div > div:nth-child(2) > div > label:nth-child(1) > input')
        .check()
        .should('be.checked')
        .wait(1000)
        /*
      //verify star rating by clicking star 1
      cy.get('form > div > div:nth-child(3) > div > span > span:nth-child(1) > span:nth-child(1)')
        .click('center')//expected 50% which is equivalent to 40px
        .wait(600)
      cy.get('form > div > div:nth-child(3) > div > span > span:nth-child(1) > span:nth-child(2) > svg')
        .should('have.css', 'color', 'rgb(245, 158, 11)') //yellow color
      cy.get('form > div > div:nth-child(3) > div > span > span:nth-child(1) > span:nth-child(2)')
        .should('have.css', 'width', '40px') // the 100% is 80px 

      cy.wait(2000)
        *//////////////////////
      //Then I will click the full star 1
      cy.get('form > div > div:nth-child(3) > div > span > span:nth-child(1) > span:nth-child(1)')
        .click('right')//expected 100% which is equivalent to 80px
        .wait(600)
        .should('have.css', 'width', '80px') // the 100% is 80px 
      cy.get('form > div > div:nth-child(3) > div > span > span:nth-child(1) > span:nth-child(2) > svg')
        .should('have.css', 'color', 'rgb(245, 158, 11)') //yellow color
    
      //Upload a file
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].AdditionalInformationScreenshotsLabelandButton)
        .within(()=>{
          //upload an image file
          cy.get(' > div > div > input')
            .should('exist')
            .attachFile('azoginsuit.jpg')
            .wait(1000)
          //verify that the name of the buttone is now Upload more
          cy.get(' > div > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'Upload more')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '700') //font bold
            .and('have.css', 'border-color', 'rgb(148, 148, 148)')
            .and('have.css', 'border-radius', '40px') //the curve of the edge of the button
          //Then verify the uploaded image file is in the Modal
          cy.get(' > div:nth-child(2)')
            .should('exist')
            .within(()=>{
              //assert the x close button on top right corner of the uploaded image 
              cy.get(' > div > div:nth-child(1)')
                .should('exist')
                .and('not.be.disabled')
                .and('have.css', 'background-color', 'rgb(0, 47, 93)') // the circular blue color that surrounds the x button
                .find('svg').should('exist').and('have.css', 'color', 'rgb(255, 255, 255)') //the x text color
              //assert the uploaded image itself
              cy.get(' > div > div:nth-child(2) > img')
                .should('exist')
                .and('have.css', 'width', '131px') //the rendered width size of the uploaded image file
                .and('have.css', 'height', '133px') //the rendered height size of the uploaded image file
            })
        })
        
      //Add Additional Notes Related to this Rating
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].AnyadditionalNotesRelatedToThisRatingLabelandTextareafield)
        .find('textarea[name="information"]')
        .clear()
        .type('The notes here that I added is for testing purposes only.')
        .wait(600)
        .should('have.value', 'The notes here that I added is for testing purposes only.')

      //verify that the Submit button should be enabled since all the required elements are now filled
      cy.get(clientratingdashboard.RateAccountPerformanceModal[0].SubmitButton)
        .should('not.be.disabled')
        .click()
        .wait(3000)
        
      //////// PARTNER RATING DASHBOARD TABLE LIST ASSERTIONS STARTS HERE ///////////////
      
      //verify first the column names
      //verify Column Names
      const expected_columnNames = [
        'Review',
        'Details',
        'Date Added',
        'Reviewer',
        'Rating',
        'View Details'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
          cy.wrap($option).should('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          .and('have.css', 'font-weight', '700') //font bold
          cy.log(expected_columnNames[index]) 
      });

      //Now verify the table in row 1
      cy.get('table >tbody > tr:first-child').within(()=>{
        //assert Column1 > Review Name / the selected type of review you choose
        cy.get(' > td:nth-child(1)')
          .should('exist')
          .and('not.be.disabled')
          .and('have.text', 'Finished Tasks')
          .and('have.css', 'color', 'rgb(24, 121, 216)') //text color
        //assert Column 2 > Details / the added related notes you entered
        cy.get(' > td:nth-child(2)')
          .should('exist')
          .and('have.text', 'The notes here that I added is for testing purposes only.')
          .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        //assert Column 3 > Date Added
        cy.get(' > td:nth-child(3)')
          .should('exist')
          .and('have.text', utilfunc.getFormattedDateMonthDayYearVersion3())
          .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        //assert Column 4 > Reviewer
        cy.get(' > td:nth-child(4)')
          .should('exist')
          .within(()=>{
            cy.get('> div > div > span')  //the initial logo
              .should('exist')
              .and('have.text', 'LP')
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')             //the curve edge that form the background color like a circle
          })
        //assert Column 5 > Rating
        cy.get(' > td:nth-child(5) > div')
          .should('exist')
          .within(()=>{
            //assert the rating value which is 1 meaning 1 star
            cy.get('p')
              .should('exist')
              .and('have.text', '1')
              .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
              .and('have.css', 'font-weight', '700') //font bold
              .and('have.css', 'font-size', '25px')
            //assert the 1st star from the left to the right
            cy.get(' > span > span')
              .should('exist')
              .and('have.length', 5) // 5 stars
          })
        //assert Column 6 > View Details
        cy.get(' > td:nth-child(6) > div')
          .should('exist')
          .and('not.be.disabled')
          .find('svg').should('have.css', 'color', 'rgb(0, 150, 109)')
      })

    //Then I will click the view details button
    cy.get('table >tbody > tr:first-child > td:nth-child(6) > div')
      .click()
      .wait(2000)

    //verify Account Performance Review Modal popup
    cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].modal)
      .should('exist')

    /////// ACCOUNT PERFORMANCE REVIEW MODAL ASSERTIONS STARTS HERE //////////

    //verify modal title
    cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].modaltitle)
      .should('exist')
      .and('have.text', 'Account Performance Review')
      .and('have.css', 'font-weight', '700') //font bold

    //verify Partners Account Label and the Client Name
    cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].PartnersAccountLabelandClientName)
      .should('exist')
      .within(()=>{
        //assert the Partner's Account Label 
        cy.get(' > p:nth-child(1)')
          .should('exist')
          .and('have.text', "Partner's Account")
          .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
        //assert the client Name
        cy.get(' > p:nth-child(2)')
          .should('exist')
          .then((txt)=>{
            GETClientName.then(()=>{
              expect(txt.text().trim()).to.equal(clientName);
            })
          })
      })

    //verify Reviewer Label and the Name of the Reviewer
    cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].ReviewerLabelandReviewerName)
      .should('exist')
      .within(()=>{
        //assert Reviewer Label
        cy.get(' > p')
          .should('exist')
          .and('have.text', "Reviewer")
          .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
        //assert Reviewer Name
        cy.get('div')
          .then(()=>{
            //assert the Initial Logo
            cy.get(' > div > div > div > span')
              .should('exist')
              .and('have.text', 'LP')
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
              .and('have.css', 'border-radius', '9999px')
            //assert the name
            cy.get(' div > p')
              .should('exist')
              .and('have.text', "Logan Paul")
          })
      })

      //verify the Date Added Label and the Date
      cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].DateAddedLabelandTheDate)
        .should('exist')
        .within(()=>{
          //assert the Date Added Label
          cy.get('p:nth-child(1)')
            .should('exist')
            .and('have.text', "Date Added")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //verify the Date 
          cy.get('p:nth-child(2)')
            .should('exist')
            .and('have.text', utilfunc.getFormattedDateMonthDayYearVersion3())
        })

      //verify Type Label and the type
      cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].TypeLabelandTheSelectedType)
        .should('exist')
        .within(()=>{

          //assert the Type Label
          cy.get('p:nth-child(1)')
            .should('exist')
            .and('have.text', "Type")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //verify the Date 
          cy.get('p:nth-child(2)')
            .should('exist')
            .and('have.text', 'Finished Tasks')
        })

      //verify the Rating Label and the number and stars elements
      cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].RatingLabelandTheStars)
        .should('exist')
        .within(()=>{
          //assert the Rating Label
          cy.get(' > p')
            .should('exist')
            .and('have.text', "Rating")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //verify the Count / score rating 
          cy.get(' > div > p')
            .should('exist')
            .and('have.text', '1')
          //assert the Stars
          cy.get(' > div > span > span')
            .should('exist')
            .and('have.length', 5) // 5 stars
        })

      //verify the Files Uploaded Label and the File
      cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].FilesUploadedLabelandTheFile)
        .should('exist')
        .within(()=>{
          //assert the Files Uploaded Label
          cy.get(' > p')
            .should('exist')
            .and('have.text', "Files Uploaded")
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .and('have.css', 'font-weight', '700') //font bold
          //verify the file itself
          cy.get(' > div > div > img')
            .should('exist')
        })

      //verify the Additional Notes Label and the Notes
      cy.get(clientratingdashboard.AccountPerformanceReviewModal[0].AdditionalNotesLabelandTheNotes)
        .should('exist')
        .within(()=>{
          //assert the Files Uploaded Label
          cy.get('p:nth-child(1)')
            .should('exist')
            .and('have.text', "Additional Notes")
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .and('have.css', 'font-weight', '700') //font bold
          //verify the file itself
          cy.get('p:nth-child(2)')
            .should('exist')
            .and('have.text', 'The notes here that I added is for testing purposes only.')
        })
        
    })
    // **** CLIENT RATING DASHBOARD ENDS HERE ***
    // **** CLIENT ADMIN BOARD PAUSE REQUEST STARTS HERE ***
    it.skip("Testcase ID: CAAR0001 - Verify user can Add Request",()=>{

      //calling utility functions
      const utilfunc = new utilityfunctions();
   
      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
      //verify there this is Admin Board link text folder under the client module
      //verify first the logo/icon beside the Admin Board link text folder
      cy.get(clientmodules.clientmodulesubfolderslink[0].adminboardicon) //star logo / icon next to Rating Dashboard link text
      .should('have.css', 'color', 'rgb(156, 163, 175)') // color
      .and('be.visible')
      .and('exist')
      .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
      })
      cy.get(clientmodules.clientmodulesubfolderslink[0].adminboard) //Rating Dashboard link text
      .should('have.css', 'color', 'rgb(156, 163, 175)') // text color
      .and('be.visible')
      .and('exist')
      .and('not.be.disabled')
      .and('have.text', 'Admin Board')
      .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
      })

      //Click the Admin Board Link text folder
      cy.click_link_button(clientmodules.clientmodulesubfolderslink[0].adminboard)
      .wait(1000)

      //verify correct destination page url
      cy.url().should('contain', '/clients/admin/team-level')

      //verify the color changes the star logo/icon and the Admin Board link text when it redirected to the Admin Board page
      cy.get(clientmodules.clientmodulesubfolderslink[0].adminboardicon) //star logo / icon next to Admin Board link text
      .should('have.css', 'color', 'rgb(239, 68, 68)') // color
      cy.get(clientmodules.clientmodulesubfolderslink[0].adminboard) //Admin Board link text
      .should('have.css', 'color', 'rgb(239, 68, 68)') // text color


    })
    // **** CLIENT ADMIN BOARD PAUSE REQUEST ENDS HERE ***
    // **** CLIENT CLIENT COMPLAINT STARTS HERE ***
    it("Testcase ID: CC0001 - Verify client partner can add complaint form",()=>{

      let GETClientName;
      let clientName;
      let GETClientPartnerFullName;
      let clientFullName;

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //GET the Client Partner full name in the Client > Client Dashboard > Profile > Overview > Contact Name
      GETClientPartnerFullName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].OverivewContactName).then((cName)=>{
          clientFullName = cName.text().trim();
          resolve();
        })
      })
    
      //verify there this is Complaints link text folder under the client module
      cy.get(linktextfolders.CLIENTmodules[0].Complaints_linktextFolder) //Complaints link text
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Complaints')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default text color
        .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(156, 163, 175)') //its star icon verification

      //Click the Complaints Link text folder
      cy.get(linktextfolders.CLIENTmodules[0].Complaints_linktextFolder)
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') // text color
        .find('svg').should('have.css', 'color', 'rgb(239, 68, 68)') //text color

      //verify correct destination page url
      cy.url().should('contain', '/clients/complaints')
  
      //verify Complaints page title - Complaints
      cy.get(clientcomplaints.PageTitle)
        .should('exist')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.text', 'Complaints')

      //verify Add button if Found then click
      cy.get(clientcomplaints.AddButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Add')
        .and('have.css', 'border-color', 'rgb(0, 47, 93)') //border capsule shape color
        .and('have.css', 'border-radius', '40px') // the curve edge 
        .click()
        .wait(2000)

      //verify that the Client Complaint Form modal popup
      cy.get(clientcomplaints.ClientComplaintFormModal[0].modal)
        .should('exist')

      ////////////// CLIENT COMPLAINT FORM MODAL ELEMENT ASSERTIONS STARTS HERE ////////////////
      
      //verify Client Complaint Form modal title
      cy.get(clientcomplaints.ClientComplaintFormModal[0].modaltitle)
        .should('exist')
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.text', 'Client Complaint Form')

      //verify Partners Account Label and the Select Partners Account select menu
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .should('exist')
        .within(()=>{
          //assert Partner's Account Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', "Partner's Account*")
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert Select Partner's Account button
          cy.get(' > div > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', "Select Partner's Account")
            .and('have.attr', 'aria-expanded', 'false') // it means if the Select Partner's Account is not yet click, then it is still abutton
          //Then I am going to click the Select Partner's Account button
          cy.get(' > div > div > button')
            .click()
            .wait(1000)
            .should('have.attr', 'aria-expanded', 'true') //it means it becomes a select drop down menu
          //verify that there is a Search input field
          cy.get('input[type="email"][name="email"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Search')
          //assert the drop down menu - there should be no zero - at least 1
          cy.get('div.scrollbar-container > ul > li')
            .should('exist')
            .and('have.length.gt', 0)
          //Now if I am going to click Again the Select Partner's Account button
          cy.get(' > div > div > button')
            .click()
            .wait(1000)
            .should('have.attr', 'aria-expanded', 'false') //it means it becomes back as a button
          //assert that the Search Input field should not be visible
          cy.get('input[type="email"][name="email"]')
            .should('not.exist')
          //assert the drop down menu should not be visible
          cy.get('div.scrollbar-container > ul > li')
            .should('not.exist')
        })

      //verify Type of Complaints Label and the lists of complaints
      cy.get(clientcomplaints.ClientComplaintFormModal[0].TypeofComplaintLabelandTheLists)
        .should('exist')
        .within(()=>{
          //asser the Type of Complaint Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', "Type of Complaint*")
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert the Type of Complaint lists - one by one
          const TypeofComplaintsLists = [
            'Onboarding Process',
            'Missed Meetings',
            'Creatives',
            'Missed deadlines/Delays',
            'Copywriting',
            'Lack of sales growth',
            'Communication',
            'PPC Issues',
            'Other'
          ];
          cy.get(' > div > label').each(($label, index)=>{
            cy.wrap($label)
              .should('have.text', TypeofComplaintsLists[index]) //verify names based on the expected
              .and('not.be.checked')
              .and('not.be.disabled')
              cy.log(TypeofComplaintsLists[index])
            })
          //tick or check each radio button
          cy.get(' > div > label > input')
            .each(($input) => {
              cy.wrap($input).check()
                .wait(700)
                .should('be.checked')
            })
        })

      //verify How many times has this client reached out regarding this issue to you? Label and drop down menu
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .should('exist')
        .within(()=>{
          //assert the How many times has this client reached out regarding this issue to you? label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'How many times has this client reached out regarding this issue to you?*')
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert Select Number of Occurence drop down menu
          cy.get(' > select[name="occurence"]')
            .should('exist')
            .and('not.be.disabled')
          //and the expected options
          const expectedOptions = [
            'Select Number of Occurence',
            '1st',
            '2nd',
            '3rd',
            '4th',
            '5th+'
          ];
          cy.get(" > select[name='occurence'] > option").each(($option, index) => {
            cy.wrap($option)
              .should('have.text', expectedOptions[index])
              .and('not.be.disabled')
          });
        })

      //verify Urgency Level Label and each of the 1-2 elements
      cy.get(clientcomplaints.ClientComplaintFormModal[0].UrgencyLevelLabelandDropdownMenu)
        .should('exist')
        .within(()=>{
          //assert the Urgency Level label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Urgency Level*')
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert the number elements from 1 to 5
          cy.get(' > div > button')
            .should('exist')
            .each(($button)=>{
              cy.wrap($button)
                .should('exist')
                .and('not.be.disabled')
            })
        })
      //Click one by one and assert changes in the UI
      cy.get(clientcomplaints.ClientComplaintFormModal[0].UrgencyLevelLabelandDropdownMenu)
        .within(()=>{
          //click and then assert number 1
          cy.get(' > div > button:nth-child(1)')
            .click()
            .wait(700)
            .should('have.css', 'color', 'rgb(191, 166, 84)') //text color
            .and('have.css', 'background-color', 'rgb(249, 220, 125)') //background color
            .and('have.css', 'border-radius', '9999px')
          //click and then assert number 2
          cy.get(' > div  > button:nth-child(2)')
            .click()
            .wait(700)
            .should('have.css', 'color', 'rgb(191, 166, 84)') //text color
            .and('have.css', 'background-color', 'rgb(249, 220, 125)') //background color
            .and('have.css', 'border-radius', '9999px')
          //assert number 1 that it should go back to normal
          cy.get(' > div > button:nth-child(1)')
            .should('have.css', 'color', 'rgb(0, 0, 0)') //text color
            .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)') //background color
          //click and then assert number 3
          cy.get(' > div  > button:nth-child(3)')
            .click()
            .wait(700)
            .should('have.css', 'color', 'rgb(212, 130, 54)') //text color
            .and('have.css', 'background-color', 'rgb(255, 210, 185)') //background color
            .and('have.css', 'border-radius', '9999px')
          //assert number 2 that it should go back to normal
          cy.get(' > div > button:nth-child(2)')
            .should('have.css', 'color', 'rgb(0, 0, 0)') //text color
            .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)') //background color
          //click and then assert number 4
          cy.get(' > div  > button:nth-child(4)')
            .click()
            .wait(700)
            .should('have.css', 'color', 'rgb(212, 130, 54)') //text color
            .and('have.css', 'background-color', 'rgb(255, 210, 185)') //background color
            .and('have.css', 'border-radius', '9999px')
          //assert number 3 that it should go back to normal
          cy.get(' > div > button:nth-child(3)')
            .should('have.css', 'color', 'rgb(0, 0, 0)') //text color
            .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)') //background color
          //click and then assert number 5
          cy.get(' > div  > button:nth-child(5)')
            .click()
            .wait(700)
            .should('have.css', 'color', 'rgb(195, 0, 0)') //text color
            .and('have.css', 'background-color', 'rgb(255, 175, 175)') //background color
            .and('have.css', 'border-radius', '9999px')
        })

      //verify Additional Information Screenshots Label and button
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .should('exist')
        .within(()=>{
          //assert the Additional Information Screenshots Label
          cy.get(' > div:nth-child(1) > label')
            .should('exist')
            .and('have.text', 'Additional Information Screenshots*')
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert Additional Information Screenshots button
          cy.get(' > div:nth-child(1) > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'Additional Information Screenshots')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '700') //font bold
            .and('have.css', 'border-color', 'rgb(148, 148, 148)')
            .and('have.css', 'border-radius', '40px') //the curve of the edge of the button
        })

      //verify Any additional notes related to this complaint? Label and textarea field
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AnyAdditionalNotesRelatedToThisComplaintLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert the Additional Information Screenshots Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Any additional notes related to this complaint?*')
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert textarea field
          cy.get(' > textarea[name="information"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') // empty by default
        })

      //verify Cancel Button
      cy.get(clientcomplaints.ClientComplaintFormModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', "Cancel")
        .and('have.css', 'color', 'rgb(24, 121, 216)') //text color
        .and('have.css', 'font-weight', '700') //font bold

      //verify Submit Button
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .should('exist')
        .and('be.disabled') //by default the button should be disabled because it has a required elements needs to respond inside the Rate Account Performance modal
        .and('have.text', "Submit")
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'background-color', 'rgb(0, 28, 55)') //the button capsule color

      ///////// CLIENT COMPLAINT FORM REQUIRED ASSERTIONS STARTS HERE ///////////

      //Select Client test in the Select Partner's Account
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .within(()=>{
          //click the button
          cy.get(' > div > div > button')
          .click()
          .wait(1000)
          //enter the client name in the Search Input field
          cy.get('input[type="email"][name="email"]')
            .clear()
            .type('(AAAROO)')
            .wait(2000)
          //Then as it appears, click the client test
          cy.get('ul > li > button')
            .click()
            .wait(700)
        })

      //verify that it appeared on top after it was selected
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .find(' > div > div > button')
        .then((txt)=>{
          GETClientName.then(()=>{
            expect(txt.text().trim()).to.equal(clientName);
          })
        })

      //Select Type of Complaint - Onboarding Process
      cy.get(clientcomplaints.ClientComplaintFormModal[0].TypeofComplaintLabelandTheLists)
        .find(' > div > label:nth-child(1) > input')
        .check()
        .should('be.checked')

      //Select Number of Occurence
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .find(" > select[name='occurence']")
        .select('2').should('have.value','2')
        .wait(2000)
      //verify that the selected number of occurence is on top 
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .find('select option:selected')
        .should('have.text', '2nd')

      //Select Urgency Level
      cy.get(clientcomplaints.ClientComplaintFormModal[0].UrgencyLevelLabelandDropdownMenu)
        .find(' > div > button:nth-child(1)')
        .click()
        .wait(1000)

      //Upload Additional Screenshot
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .find(' > div:nth-child(1) > div > input')
        .attachFile('azoginsuit.jpg')
        .wait(2000)

      //verify that the Additional Screenshot button has changed its name and now it becomes Upload more
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .within(()=>{
          //assert buton name
          cy.get(' > div:nth-child(1) > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'Upload more')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '700') //font bold
            .and('have.css', 'border-color', 'rgb(148, 148, 148)')
            .and('have.css', 'border-radius', '40px') //the curve of the edge of the button
          //assert the uploaded image file
          cy.get(' > div:nth-child(2) > div')
            .should('exist')
            .within(()=>{
              //assert the x close button
              cy.get(' > div:nth-child(1)')
                .should('exist')
                .and('not.be.disabled')
                .and('have.css', 'background-color', 'rgb(0, 47, 93)') // blue circle background color
                .find('svg').should('have.css', 'color', 'rgb(255, 255, 255)') // text color
              //the image
              cy.get(' > div:nth-child(2) > img')
                .should('exist')
            })
        })

      //Add data on Any additional notes related to this complaint?
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AnyAdditionalNotesRelatedToThisComplaintLabelandTextareafield)
        .find(' > textarea[name="information"]')
        .clear()
        .type('This is only a test data for testing purposes only')
        .wait(500)
        .should('have.value', 'This is only a test data for testing purposes only')

      //verify that the submit button now is enabled
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .should('not.be.disabled')

      //Then click the Submit button
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .click()
        .wait(3000)
        
      //////// COMPLAINTS TABLET LISTS ASSERTIONS STARTS HERE ///////////////

      //verify first the Column Names
      const columnNames = [
        "Partner's Account",
        "Partner's Name",
        "Submitted Date",
        "Submitted By",
        "Sales Representative",
        "Project Manager",
        "Type",
        "Occurence",
        "Urgency Level",
        "Status",
        "Action"
      ]
      cy.get('table > thead > tr > th').each(($option, index)=>{
        cy.wrap($option)
          .should('exist')
          .and('have.text', columnNames[index])
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          .and('have.css', 'font-weight', '700') //font bold
        cy.log(columnNames[index])
      })

      //Then verify each columns in row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Partner's Account / Client Name
        cy.get(' > td:nth-child(1) > a')
          .should('exist')
          .and('not.be.disabled')
          .then((txt)=>{
            GETClientName.then(()=>{
              expect(txt.text().trim()).to.equal(clientName);
            })
          })
        //assert Column 2 > Partner's Name / Client Partner's Name
        cy.get(' > td:nth-child(2)')
          .should('exist')
          .then((txt)=>{
            GETClientPartnerFullName.then(()=>{
              expect(txt.text().trim()).to.equal(clientFullName);
            })
          })
        //assert Column 3 > Submitted Date
        cy.get(' > td:nth-child(3)')
          .should('exist')
          .and('have.text', utilfunc.getFormattedDateMonthDayYearVersion3())
        //assert Column 4 > Submitted By
        cy.get(' > td:nth-child(4) > div')
          .should('exist')
          .within(()=>{
            //assert Logo Initial
            cy.get(' > div > div > span')
              .should('exist')
              .and('have.text', 'LP')
              .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
              .and('have.css', 'border-radius', '9999px')
            //assert the Name
            cy.get(' > span')
              .should('exist')
              .and('have.text', 'Logan Paul')
          })
        //assert Column 5 > Sales Representative - this is optional
        //assert Column 6 > Project Manager
        cy.get(' > td:nth-child(6) > div')
          .should('exist')
          .within(()=>{
            //assert Logo Initial
            cy.get(' > div > div > span')
              .should('exist')
              .and('have.text', 'PK')
              .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
              .and('have.css', 'border-radius', '9999px')
            //assert the Name
            cy.get(' > span')
              .should('exist')
              .and('have.text', 'Peter Kanluran')
          })
        //assert Column 7 > Type
        cy.get(' > td:nth-child(7)')
          .should('exist')
          .and('have.text', 'Onboarding Process')
        //assert Column 8 > Occurrence
        cy.get(' > td:nth-child(8)')
          .should('exist')
          .and('have.text', '2nd')
        //assert Column 9 > Urgency Level
        cy.get(' > td:nth-child(9) > span')
          .should('exist')
          .and('have.text', '1')
          .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
          .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
          .and('have.css', 'border-radius', '9999px')
        //assert Column 10 > Status
        cy.get(' td:nth-child(10) > span')
          .should('exist')
          .and('have.text', 'Ongoing')
          .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
          .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
          .and('have.css', 'border-radius', '40px')
        //assert Column 11 > Action:View
        cy.get(' > td:nth-child(11) > div ')
          .should('exist')
          .and('not.be.disabled')
          .find('svg').should('have.css', 'color', 'rgb(0, 150, 109)') //text color
      })
      //////// COMPLAINTS TABLET LISTS ASSERTIONS ENDS HERE ///////////////

    })
    it("Testcase ID: CC0002 - Verify client partner can view the existing created complaint form",()=>{
      
      let GETClientName;
      let clientName;
      let GETClientPartnerFullName;
      let clientFullName;

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //GET the Client Partner full name in the Client > Client Dashboard > Profile > Overview > Contact Name
      GETClientPartnerFullName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].OverivewContactName).then((cName)=>{
          clientFullName = cName.text().trim();
          resolve();
        })
      })
    
      //Click the Complaints Link text folder
      cy.get(linktextfolders.CLIENTmodules[0].Complaints_linktextFolder)
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') // text color
        .find('svg').should('have.css', 'color', 'rgb(239, 68, 68)') //text color

      //verify correct destination page url
      cy.url().should('contain', '/clients/complaints')
  
      //verify Add button if Found then click
      cy.get(clientcomplaints.AddButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Add')
        .and('have.css', 'border-color', 'rgb(0, 47, 93)') //border capsule shape color
        .and('have.css', 'border-radius', '40px') // the curve edge 
        .click()
        .wait(2000)

      //verify that the Client Complaint Form modal popup
      cy.get(clientcomplaints.ClientComplaintFormModal[0].modal)
        .should('exist')

      ///////// CLIENT COMPLAINT FORM REQUIRED ASSERTIONS STARTS HERE ///////////

      //Select Client test in the Select Partner's Account
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .within(()=>{
          //click the button
          cy.get(' > div > div > button')
          .click()
          .wait(1000)
          //enter the client name in the Search Input field
          cy.get('input[type="email"][name="email"]')
            .clear()
            .type('(AAAROO)')
            .wait(2000)
          //Then as it appears, click the client test
          cy.get('ul > li > button')
            .click()
            .wait(700)
        })

      //verify that it appeared on top after it was selected
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .find(' > div > div > button')
        .then((txt)=>{
          GETClientName.then(()=>{
            expect(txt.text().trim()).to.equal(clientName);
          })
        })

      //Select Type of Complaint - Onboarding Process
      cy.get(clientcomplaints.ClientComplaintFormModal[0].TypeofComplaintLabelandTheLists)
        .find(' > div > label:nth-child(1) > input')
        .check()
        .should('be.checked')

      //Select Number of Occurence
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .find(" > select[name='occurence']")
        .select('2').should('have.value','2')
        .wait(2000)
      //verify that the selected number of occurence is on top 
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .find('select option:selected')
        .should('have.text', '2nd')

      //Select Urgency Level
      cy.get(clientcomplaints.ClientComplaintFormModal[0].UrgencyLevelLabelandDropdownMenu)
        .find(' > div > button:nth-child(1)')
        .click()
        .wait(1000)

      //Upload Additional Screenshot
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .find(' > div:nth-child(1) > div > input')
        .attachFile('azoginsuit.jpg')
        .wait(2000)

      //verify that the Additional Screenshot button has changed its name and now it becomes Upload more
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .within(()=>{
          //assert buton name
          cy.get(' > div:nth-child(1) > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'Upload more')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '700') //font bold
            .and('have.css', 'border-color', 'rgb(148, 148, 148)')
            .and('have.css', 'border-radius', '40px') //the curve of the edge of the button
          //assert the uploaded image file
          cy.get(' > div:nth-child(2) > div')
            .should('exist')
            .within(()=>{
              //assert the x close button
              cy.get(' > div:nth-child(1)')
                .should('exist')
                .and('not.be.disabled')
                .and('have.css', 'background-color', 'rgb(0, 47, 93)') // blue circle background color
                .find('svg').should('have.css', 'color', 'rgb(255, 255, 255)') // text color
              //the image
              cy.get(' > div:nth-child(2) > img')
                .should('exist')
            })
        })

      //Add data on Any additional notes related to this complaint?
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AnyAdditionalNotesRelatedToThisComplaintLabelandTextareafield)
        .find(' > textarea[name="information"]')
        .clear()
        .type('This is only a test data for testing purposes only')
        .wait(500)
        .should('have.value', 'This is only a test data for testing purposes only')

      //verify that the submit button now is enabled
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .should('not.be.disabled')

      //Then click the Submit button
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .click()
        .wait(3000)
        
      //////// COMPLAINTS TABLET LISTS ASSERTIONS STARTS HERE ///////////////

      //verify first the Column Names
      const columnNames = [
        "Partner's Account",
        "Partner's Name",
        "Submitted Date",
        "Submitted By",
        "Sales Representative",
        "Project Manager",
        "Type",
        "Occurence",
        "Urgency Level",
        "Status",
        "Action"
      ]
      cy.get('table > thead > tr > th').each(($option, index)=>{
        cy.wrap($option)
          .should('exist')
          .and('have.text', columnNames[index])
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          .and('have.css', 'font-weight', '700') //font bold
        cy.log(columnNames[index])
      })

      //Then verify each columns in row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Partner's Account / Client Name
        cy.get(' > td:nth-child(1) > a')
          .should('exist')
          .and('not.be.disabled')
          .then((txt)=>{
            GETClientName.then(()=>{
              expect(txt.text().trim()).to.equal(clientName);
            })
          })
        //assert Column 2 > Partner's Name / Client Partner's Name
        cy.get(' > td:nth-child(2)')
          .should('exist')
          .then((txt)=>{
            GETClientPartnerFullName.then(()=>{
              expect(txt.text().trim()).to.equal(clientFullName);
            })
          })
        //assert Column 3 > Submitted Date
        cy.get(' > td:nth-child(3)')
          .should('exist')
          .and('have.text', utilfunc.getFormattedDateMonthDayYearVersion3())
        //assert Column 4 > Submitted By
        cy.get(' > td:nth-child(4) > div')
          .should('exist')
          .within(()=>{
            //assert Logo Initial
            cy.get(' > div > div > span')
              .should('exist')
              .and('have.text', 'LP')
              .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
              .and('have.css', 'border-radius', '9999px')
            //assert the Name
            cy.get(' > span')
              .should('exist')
              .and('have.text', 'Logan Paul')
          })
        //assert Column 5 > Sales Representative - this is optional
        //assert Column 6 > Project Manager
        cy.get(' > td:nth-child(6) > div')
          .should('exist')
          .within(()=>{
            //assert Logo Initial
            cy.get(' > div > div > span')
              .should('exist')
              .and('have.text', 'PK')
              .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
              .and('have.css', 'border-radius', '9999px')
            //assert the Name
            cy.get(' > span')
              .should('exist')
              .and('have.text', 'Peter Kanluran')
          })
        //assert Column 7 > Type
        cy.get(' > td:nth-child(7)')
          .should('exist')
          .and('have.text', 'Onboarding Process')
        //assert Column 8 > Occurrence
        cy.get(' > td:nth-child(8)')
          .should('exist')
          .and('have.text', '2nd')
        //assert Column 9 > Urgency Level
        cy.get(' > td:nth-child(9) > span')
          .should('exist')
          .and('have.text', '1')
          .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
          .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
          .and('have.css', 'border-radius', '9999px')
        //assert Column 10 > Status
        cy.get(' td:nth-child(10) > span')
          .should('exist')
          .and('have.text', 'Ongoing')
          .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
          .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
          .and('have.css', 'border-radius', '40px')
        //assert Column 11 > Action:View
        cy.get(' > td:nth-child(11) > div ')
          .should('exist')
          .and('not.be.disabled')
          .find('svg').should('have.css', 'color', 'rgb(0, 150, 109)') //text color
      })
      //////// COMPLAINTS TABLET LISTS ASSERTIONS ENDS HERE ///////////////

      //Then I will click the Action: View button
      cy.get('table > tbody > tr:first-child > td:nth-child(11) > div')
        .click()
        .wait(3000)

      //verify Complaint View Modal popup
      cy.get(clientcomplaints.ComplaintViewModal[0].modal)
        .should('exist')

      ///////// COMPLAINT VIEW MODAL ELEMENT ASSERTIONS STARTS HERE ///////////////

      //verify modal title
      cy.get(clientcomplaints.ComplaintViewModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Complaint')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
      
      //verify Partner's Account label and the Partner's Account Name
      cy.get(clientcomplaints.ComplaintViewModal[0].PartnersAccountLabelandPartnerAccountsName)
        .should('exist')
        .within(()=>{
          //assert Partner's Account Label
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', "Partner's Account")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert Partner's Account Name / Client Name
          cy.get(' > p:nth-child(2)')
            .should('exist')
            .then((txt)=>{
              GETClientName.then(()=>{
                expect(txt.text().trim()).to.equal(clientName);
              })
            })
        })
      
      //verify Partner's Name / Client Partner's Full Name
      cy.get(clientcomplaints.ComplaintViewModal[0].PartnersAccountNameLabelandPartnersAccountFullName)
        .should('exist')
        .within(()=>{
          //assert Partner's Account Label
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', "Partner's Name")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert Partner's Account Name / Client Name
          cy.get(' > p:nth-child(2)')
            .should('exist')
            .then((txt)=>{
              GETClientPartnerFullName.then(()=>{
                expect(txt.text().trim()).to.equal(clientFullName);
              })
            })
        })

      //verify Submitted Date Label and the Date
      cy.get(clientcomplaints.ComplaintViewModal[0].SubmittedDateLabelandTheDate)
        .should('exist')
        .within(()=>{
          //assert Partner's Account Label
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', "Submitted Date")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert Partner's Account Name / Client Name
          cy.get(' > p:nth-child(2)')
            .should('exist')
            .and('have.text', utilfunc.getFormattedDateMonthDayYearVersion3())
        })

      //verify Submitted By Label and the Initial Logo of the Submitter and its Full Name
      cy.get(clientcomplaints.ComplaintViewModal[0].SubmittedByLabelandTheSubmitter)
        .should('exist')
        .within(()=>{
          //assert the Submitted By label
          cy.get(' > p')
            .should('exist')
            .and('have.text', "Submitted By")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the Initial Logo of the Submitter
          cy.get(' > div > div > div > span')
            .should('exist')
            .and('have.text', 'LP')
            .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
            .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
            .and('have.css', 'border-radius', '9999px')
          //assert the Submitter Full Name
          cy.get(' > div > p')
            .should('exist')
            .and('have.text', 'Logan Paul')
        })

      //verify Project Manager Label and the Project Manager Full Name
      cy.get(clientcomplaints.ComplaintViewModal[0].ProjectManagerLabelandTheProjectManagerFullName)
        .should('exist')
        .within(()=>{
          //assert Project Manager Label
          cy.get(' > p')
            .should('exist')
            .and('have.text', "Project Manager")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert PM Initial Logo
          cy.get(' > div > div > div > span')
            .should('exist')
            .and('have.text', 'PK')
          //assert PM Full Name
          cy.get(' > div > p')
            .should('exist')
            .and('have.text', 'Peter Kanluran')
        })

      //verify Type Label and the selected Type
      cy.get(clientcomplaints.ComplaintViewModal[0].TypeLabelandTheselectedType)
        .should('exist')
        .within(()=>{
          //assert Type Label
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', "Type")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the selected type
          cy.get(' > p:nth-child(2)')
            .should('exist')
            .and('have.text', 'Onboarding Process')
        })

      //verify Occurent Label and the selected Occurence
      cy.get(clientcomplaints.ComplaintViewModal[0].OccurentLabelandTheselectedOccurent)
        .should('exist')
        .within(()=>{
          //assert Type Label
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', "Occurent")
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          //assert the selected type
          cy.get(' > p:nth-child(2)')
            .should('exist')
            .and('have.text', '2nd')
        })

      //verify Files Uploaded by Client Label and the Uploaded File
      cy.get(clientcomplaints.ComplaintViewModal[0].FilesUploadedByClientLabelandTheUploadedFILE)
        .should('exist')
        .within(()=>{
          //assert the Files Uploaded by Client Label
          cy.get(' > p')
            .should('exist')
            .and('have.text', 'Files Uploaded by client')
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .and('have.css', 'font-weight', '700') // font bold
          //assert the Uploaded Image
          cy.get(' > div > div > img')
            .should('exist')
        })

      //verify Additional Notes Label and the Note
      cy.get(clientcomplaints.ComplaintViewModal[0].AdditionalNotesLabelandTheNote)
        .should('exist')
        .within(()=>{
          //assert Type Label
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', "Additional Notes")
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .and('have.css', 'font-weight', '700') // font bold
          //assert the selected type
          cy.get(' > p:nth-child(2)')
            .should('exist')
            .and('have.text', 'This is only a test data for testing purposes only')
        })

      //verify Mark as Resolved button
      cy.get(clientcomplaints.ComplaintViewModal[0].MarkasResolvedButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Mark as Resolved')
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.css', 'background-color', 'rgb(0, 186, 136)') //background color
        .and('have.css', 'border-radius', '40px')

      //verify Urgency Level Number
      cy.get(clientcomplaints.ComplaintViewModal[0].UrgencyLevelNumber)
        .should('exist')
        .and('have.text', '1')
        .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
        .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
        .and('have.css', 'border-radius', '9999px')

      //verify Status
      cy.get(clientcomplaints.ComplaintViewModal[0].Status)
        .should('exist')
        .and('have.text', 'Ongoing')
        .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
        .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
        .and('have.css', 'border-radius', '40px')

      ///////// COMPLAINT VIEW MODAL ELEMENT ASSERTIONS ENDS HERE ///////////////
      
    })
    it("Testcase ID: CC0003 - Verify client partner can mark as resolved the existing created complaint form",()=>{
      
      let GETClientName;
      let clientName;
      let GETClientPartnerFullName;
      let clientFullName;

      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)

      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //click the row 1 test in the active client 
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET the current client name and store it in a variable
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })

      //GET the Client Partner full name in the Client > Client Dashboard > Profile > Overview > Contact Name
      GETClientPartnerFullName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].OverivewContactName).then((cName)=>{
          clientFullName = cName.text().trim();
          resolve();
        })
      })
    
      //Click the Complaints Link text folder
      cy.get(linktextfolders.CLIENTmodules[0].Complaints_linktextFolder)
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') // text color
        .find('svg').should('have.css', 'color', 'rgb(239, 68, 68)') //text color

      //verify correct destination page url
      cy.url().should('contain', '/clients/complaints')
  
      //verify Add button if Found then click
      cy.get(clientcomplaints.AddButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Add')
        .and('have.css', 'border-color', 'rgb(0, 47, 93)') //border capsule shape color
        .and('have.css', 'border-radius', '40px') // the curve edge 
        .click()
        .wait(2000)

      //verify that the Client Complaint Form modal popup
      cy.get(clientcomplaints.ClientComplaintFormModal[0].modal)
        .should('exist')

      ///////// CLIENT COMPLAINT FORM REQUIRED ASSERTIONS STARTS HERE ///////////

      //Select Client test in the Select Partner's Account
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .within(()=>{
          //click the button
          cy.get(' > div > div > button')
          .click()
          .wait(1000)
          //enter the client name in the Search Input field
          cy.get('input[type="email"][name="email"]')
            .clear()
            .type('(AAAROO)')
            .wait(2000)
          //Then as it appears, click the client test
          cy.get('ul > li > button')
            .click()
            .wait(700)
        })

      //verify that it appeared on top after it was selected
      cy.get(clientcomplaints.ClientComplaintFormModal[0].PartnersAccountLabelandSelectPartnersAccountButton)
        .find(' > div > div > button')
        .then((txt)=>{
          GETClientName.then(()=>{
            expect(txt.text().trim()).to.equal(clientName);
          })
        })

      //Select Type of Complaint - Onboarding Process
      cy.get(clientcomplaints.ClientComplaintFormModal[0].TypeofComplaintLabelandTheLists)
        .find(' > div > label:nth-child(1) > input')
        .check()
        .should('be.checked')

      //Select Number of Occurence
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .find(" > select[name='occurence']")
        .select('2').should('have.value','2')
        .wait(2000)
      //verify that the selected number of occurence is on top 
      cy.get(clientcomplaints.ClientComplaintFormModal[0].HowmanytimeshasthisclientreachedoutregardingthisissuetoyouLabelandDropdownMenu)
        .find('select option:selected')
        .should('have.text', '2nd')

      //Select Urgency Level
      cy.get(clientcomplaints.ClientComplaintFormModal[0].UrgencyLevelLabelandDropdownMenu)
        .find(' > div > button:nth-child(1)')
        .click()
        .wait(1000)

      //Upload Additional Screenshot
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .find(' > div:nth-child(1) > div > input')
        .attachFile('azoginsuit.jpg')
        .wait(2000)

      //verify that the Additional Screenshot button has changed its name and now it becomes Upload more
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AdditionalInformationScreenshotsLabelandButton)
        .within(()=>{
          //assert buton name
          cy.get(' > div:nth-child(1) > div > button')
            .should('exist')
            .and('not.be.disabled')
            .and('have.text', 'Upload more')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '700') //font bold
            .and('have.css', 'border-color', 'rgb(148, 148, 148)')
            .and('have.css', 'border-radius', '40px') //the curve of the edge of the button
          //assert the uploaded image file
          cy.get(' > div:nth-child(2) > div')
            .should('exist')
            .within(()=>{
              //assert the x close button
              cy.get(' > div:nth-child(1)')
                .should('exist')
                .and('not.be.disabled')
                .and('have.css', 'background-color', 'rgb(0, 47, 93)') // blue circle background color
                .find('svg').should('have.css', 'color', 'rgb(255, 255, 255)') // text color
              //the image
              cy.get(' > div:nth-child(2) > img')
                .should('exist')
            })
        })

      //Add data on Any additional notes related to this complaint?
      cy.get(clientcomplaints.ClientComplaintFormModal[0].AnyAdditionalNotesRelatedToThisComplaintLabelandTextareafield)
        .find(' > textarea[name="information"]')
        .clear()
        .type('This is only a test data for testing purposes only')
        .wait(500)
        .should('have.value', 'This is only a test data for testing purposes only')

      //verify that the submit button now is enabled
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .should('not.be.disabled')

      //Then click the Submit button
      cy.get(clientcomplaints.ClientComplaintFormModal[0].SubmitButton)
        .click()
        .wait(3000)
        
      //////// COMPLAINTS TABLET LISTS ASSERTIONS STARTS HERE ///////////////

      //verify first the Column Names
      const columnNames = [
        "Partner's Account",
        "Partner's Name",
        "Submitted Date",
        "Submitted By",
        "Sales Representative",
        "Project Manager",
        "Type",
        "Occurence",
        "Urgency Level",
        "Status",
        "Action"
      ]
      cy.get('table > thead > tr > th').each(($option, index)=>{
        cy.wrap($option)
          .should('exist')
          .and('have.text', columnNames[index])
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          .and('have.css', 'font-weight', '700') //font bold
        cy.log(columnNames[index])
      })

      //Then verify each columns in row 1
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Partner's Account / Client Name
        cy.get(' > td:nth-child(1) > a')
          .should('exist')
          .and('not.be.disabled')
          .then((txt)=>{
            GETClientName.then(()=>{
              expect(txt.text().trim()).to.equal(clientName);
            })
          })
        //assert Column 2 > Partner's Name / Client Partner's Name
        cy.get(' > td:nth-child(2)')
          .should('exist')
          .then((txt)=>{
            GETClientPartnerFullName.then(()=>{
              expect(txt.text().trim()).to.equal(clientFullName);
            })
          })
        //assert Column 3 > Submitted Date
        cy.get(' > td:nth-child(3)')
          .should('exist')
          .and('have.text', utilfunc.getFormattedDateMonthDayYearVersion3())
        //assert Column 4 > Submitted By
        cy.get(' > td:nth-child(4) > div')
          .should('exist')
          .within(()=>{
            //assert Logo Initial
            cy.get(' > div > div > span')
              .should('exist')
              .and('have.text', 'LP')
              .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
              .and('have.css', 'border-radius', '9999px')
            //assert the Name
            cy.get(' > span')
              .should('exist')
              .and('have.text', 'Logan Paul')
          })
        //assert Column 5 > Sales Representative - this is optional
        //assert Column 6 > Project Manager
        cy.get(' > td:nth-child(6) > div')
          .should('exist')
          .within(()=>{
            //assert Logo Initial
            cy.get(' > div > div > span')
              .should('exist')
              .and('have.text', 'PK')
              .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)') //the circular background color
              .and('have.css', 'border-radius', '9999px')
            //assert the Name
            cy.get(' > span')
              .should('exist')
              .and('have.text', 'Peter Kanluran')
          })
        //assert Column 7 > Type
        cy.get(' > td:nth-child(7)')
          .should('exist')
          .and('have.text', 'Onboarding Process')
        //assert Column 8 > Occurrence
        cy.get(' > td:nth-child(8)')
          .should('exist')
          .and('have.text', '2nd')
        //assert Column 9 > Urgency Level
        cy.get(' > td:nth-child(9) > span')
          .should('exist')
          .and('have.text', '1')
          .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
          .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
          .and('have.css', 'border-radius', '9999px')
        //assert Column 10 > Status
        cy.get(' td:nth-child(10) > span')
          .should('exist')
          .and('have.text', 'Ongoing')
          .and('have.css', 'color', 'rgb(191, 166, 84)') //text color
          .and('have.css', 'background-color', 'rgb(249, 220, 125)') //the circular background color
          .and('have.css', 'border-radius', '40px')
        //assert Column 11 > Action:View
        cy.get(' > td:nth-child(11) > div ')
          .should('exist')
          .and('not.be.disabled')
          .find('svg').should('have.css', 'color', 'rgb(0, 150, 109)') //text color
      })
      //////// COMPLAINTS TABLET LISTS ASSERTIONS ENDS HERE ///////////////

      //Then I will click the Action: View button
      cy.get('table > tbody > tr:first-child > td:nth-child(11) > div')
        .click()
        .wait(3000)

      //verify Complaint View Modal popup
      cy.get(clientcomplaints.ComplaintViewModal[0].modal)
        .should('exist')
      
      //Then Click the Mark as Resolved button
      cy.get(clientcomplaints.ComplaintViewModal[0].MarkasResolvedButton)
        .click()
        .wait(2000)

      //verify Mark as Resolved modal popup 
      cy.get(clientcomplaints.MarkasResolvedModal[0].modal)
        .should('exist')
        
      //////// MARK AS RESOLVED MODAL ELEMENTS ASSERTIONS STARTS HERE /////////

      //verify modal title
      cy.get(clientcomplaints.MarkasResolvedModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Mark as Resolved')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color

      //verify Tell us how you resolve the problem Label and its textarea field
      cy.get(clientcomplaints.MarkasResolvedModal[0].TellUsHowYouResolveTheProblemLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Tell us how you resolve the problem*')
            .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
            .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)') //text color
          //assert textarea field
          cy.get('textarea[name="resolution"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Enter additional notes here')
        })

      //verify Cancel Button
      cy.get(clientcomplaints.MarkasResolvedModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(24, 121, 216)') //text color
        .and('have.css', 'font-weight', '700') // font bold

      //verify Submit Button
      cy.get(clientcomplaints.MarkasResolvedModal[0].SubmitButton)
        .should('exist')
        .and('be.disabled')
        .and('have.text', 'Submit')

      //////// MARK AS RESOLVED MODAL ELEMENTS ASSERTIONS ENDS HERE /////////

      //Now Enter data on Tell us how you resolve the problem textarea field
      cy.get(clientcomplaints.MarkasResolvedModal[0].TellUsHowYouResolveTheProblemLabelandTextareafield)
        .find('textarea[name="resolution"]')
        .clear()
        .type('The data I entered here is for testing purposes only')
        .wait(600)
        .should('have.value', 'The data I entered here is for testing purposes only')

      //verify now the Submit button should be enabled
      cy.get(clientcomplaints.MarkasResolvedModal[0].SubmitButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Submit')
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color
        .and('have.css', 'border-radius', '40px')
        
      //THEN I will now click the Submit button 
      cy.get(clientcomplaints.MarkasResolvedModal[0].SubmitButton)
        .click()
        .wait(300)

      //verify back at the Complaint View Modal that there is no more Mark as Resolved button
      cy.get(clientcomplaints.ComplaintViewModal[0].MarkasResolvedButton)
        .should('not.exist')

      //verify there is no Ongoing Status Instead it becomes Resolved element
      cy.get(clientcomplaints.ComplaintViewModal[0].Status)
        .should('exist')
        .and('have.text', 'Resolved')
        .and('have.css', 'background-color', 'rgb(207, 255, 221)') //background color
        .and('have.css', 'border-radius', '40px')

      //Now I am going to close the Complaints View modal by {esc} keyboard
      cy.get('body').type('{esc}'); //esc keyboard execution
        
      //verify in the Complaints Table list under the same row at Column 10 > Status
      cy.get('table > tbody > tr:first-child > td:nth-child(10) > span')
        .should('exist')
        .and('have.text', 'Resolved')
        .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        .and('have.css', 'background-color', 'rgb(207, 255, 221)') //the circular background color
        .and('have.css', 'border-radius', '40px')
        
    })
    // **** CLIENT CLIENT COMPLAINT ENDS HERE ***
    // **** CLIENTS TERMINATION STARTS HERE ***
    it("Testcase ID: CT0001 - Client Initiate Termination Request for a Client",()=>{

      let GETClientService;
      let ClientService;
      let GETClientName;
      let clientName;
      let GETActivationDate;
      let ClientActivationDate;


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //GET the client Service of the test client in the last row in page 1 at column 2; can be found in the table at column 2
      GETClientService = new Promise((resolve)=>{
        cy.get('table > tbody > tr:last-child > td:nth-child(2)').then((textName)=>{
          ClientService = textName.text().trim()
          resolve();
        })
      })
      
      //Then I will select that last row in page 1 the test client 
      cy.get('table > tbody > tr:last-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET client name H1 title
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
      
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //GET the Activation Date
      GETActivationDate = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[1].SubscriptionsPage[0].OverviewSection[0].ActivationDate).then((date)=>{
          ClientActivationDate = date.text().trim();
          resolve();
        })
      })

      //verify there is Terminate link if Found then click
      cy.get(clientmoduledata.cssSelectors[1].TerminateLink)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Terminate')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  // text color
        .and('have.css', 'font-weight', '700')  // font bold
        .click()
        .wait(2000)
        
      //verify that the Termination Request modal popup open
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].modal)
        .should('exist')

      ///////// TERMINATION REQUEST MODAL ELEMENTS ASSERTIONS STARTS HERE ////////////////

      //verify modal title
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Termination Request')
        .and('have.css', 'font-weight' ,'700') // font bold
        .and('have.css', 'font-size', '25px')

      //verify ' For + Client Name '
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].clientname)
        .should('exist')
        .then((txt)=>{
          GETClientName.then(()=>{
            expect(txt.text().trim()).to.equal(`For ${clientName}`)
          })
        })
      
      //verify Reason for Termination Label and Select Menu
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].ReasonForTerminationLabelandSelectMenu)
        .should('exist')
        .within(()=>{
          //assert Reason for Termination Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Reason for termination')
            .and('have.css', 'color', 'rgb(107, 114, 128)') // text color
          //assert Select Menu
          cy.get(' > div > select[name="reason"]')
            .should('exist')
            .and('not.be.disabled')
          const listofReasons = [
            'Select Reason',
            'PPC Issues',
            'Communication Issues',
            'Design Issues',
            'Writing Issues',
            'Poor Sales Growth',
            'Amazon Listing Restriction',
            'Lack of Reporting/Strategies',
            'Not profitable - No ROI with SI',
            'SI Terminated',
            'Change of Agency',
            'Ceasing Amazon Channel',
            'SI Delays',
            'Created In-house Team',
            'Contract Fulfilled'
          ]
          cy.get(' > div > select[name="reason"] > option').each(($option, index)=>{
            cy.wrap($option)
              .should('exist')
              .and('not.be.disabled')
              .and('have.text', listofReasons[index])
            cy.log(listofReasons[index])
          })
        })

      //verify Retention Effort Checklist Label and Description
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].RetentionEffortChecklistLabelandDescription)
        .should('exist')
        .within(()=>{
          //assert Retention Effort Checklist Label
          cy.get(' > label') 
            .should('exist')
            .and('have.text', 'Retention Effort Checklist')
            .and('have.css', 'color', 'rgb(107, 114, 128)') // text color
          //assert description
          cy.get(' > div > label')
            .should('exist')
            .and('have.text', 'Before we terminate this client, we wanna make sure that all efforts are made. Kindly review the checklist and confirm the following has been done.')
            .and('have.css', 'color', 'rgb(148, 148, 148)') // text color
        })
      
      //verify Retention Effort Checklist
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].RetentionEffortChecklists)
        .should('exist')
        .within(()=>{
          const checklists = [
            'Provided a seamless onboarding process.',
            'Established a regular communication schdule.',
            'Addressed and resolve issues promptly.',
            'Reached out to clients with solutions before they encounter problems.',
            'Schedule regular check-in calls or meetings to discuss their progress, challenges, and goals.'
          ]
          cy.get(' > div > span').each(($span, index)=>{
            cy.wrap($span)
              .should('exist')
              .and('have.text', checklists[index])
            cy.log(checklists[index])
          })
        })

      //verify Additional Notes Label and Textarea field
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].AdditionalNotesLabelandTextareafield)
        .should('exist')
        .within(()=>{
          //assert Additional Notes Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Additional Notes')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert textarea field
          cy.get(' > div > textarea[name="moreInformation"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') // empty by default
        })

      //verify Cancel Button
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].CancelButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
        .and('have.css', 'font-weight' ,'700') // font bold

      //verify Request for Termination Button
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].RequestForTerminationButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Request for Termination')
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'background-color', 'rgb(195, 0, 0)') // background color 
        .and('have.css', 'border-radius', '40px')
        .and('have.css', 'font-weight' ,'700') // font bold
  
      ///////// TERMINATION REQUEST MODAL ELEMENTS ASSERTIONS ENDS HERE ////////////////

      ///// REQUIRED FIELDS ASSERTIONS STARTS HERE /////////
  
      //without fill any of the fields, click the Request for Termination Button
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].RequestForTerminationButton)
        .click()
        .wait(3000)

      //verify that the Termination Request modal popup should remain open
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].modal)
        .should('exist')
        
      //verify Error Text 1 - Please select a reason for termination
      cy.get('form > div.space-y-6 > div:nth-child(1) > div > div')
        .should('exist')
        .and('have.text', 'Please select a reason for termination')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 2 - Checklist must have at least 1 item.
      cy.get('form > div.space-y-6 > div:nth-child(3) > div:nth-child(2)')
        .should('exist')
        .and('have.text', 'Checklist must have at least 1 item.')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 3 - Please provide more information about this termination request
      cy.get('form > div.space-y-6 > div:nth-child(4) > div > div')
        .should('exist')
        .and('have.text', 'Please provide more information about this termination request')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now I will select one Reason for Termination
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].ReasonForTerminationLabelandSelectMenu)
        .find(' > div > select[name="reason"]')
        .select('Design Issues')
        .wait(700)
        .should('have.value','Design Issues')
        
      //verify that the selected reason goes on top
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].ReasonForTerminationLabelandSelectMenu)
        .find('select option:selected')
        .should('have.text', 'Design Issues')
      
      //verify that Error Text 1 - Please select a reason for termination should not be visible
      cy.get('form > div.space-y-6 > div:nth-child(1) > div > div')
        .should('not.exist')

      //verify Error Text 2 - Checklist must have at least 1 item. remains visible
      cy.get('form > div.space-y-6 > div:nth-child(3) > div:nth-child(2)')
        .should('exist')

      //verify Error Text 3 - Please provide more information about this termination request remains visible
      cy.get('form > div.space-y-6 > div:nth-child(4) > div > div')
        .should('exist')
      
      //Then Select 1 Retention Effort at Checklist - Addressed and resolve issues promptly.
      cy.get('form > div.space-y-6 > div:nth-child(3) > div > div:nth-child(3) > input[name="retentionEffortCheckList"]')
        .check()
        .wait(600)
        .should('be.checked')

      //verify Error Text 2 - Checklist must have at least 1 item. should not be visible 
      cy.get('form > div.space-y-6 > div:nth-child(3) > div:nth-child(2)')
        .should('not.exist')

      //verify Error Text 3 - Please provide more information about this termination request remains visible
      cy.get('form > div.space-y-6 > div:nth-child(4) > div > div')
        .should('exist')

      //Now Enter Data on Additional Notes Textarea field
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].AdditionalNotesLabelandTextareafield)
        .find(' > div > textarea[name="moreInformation"]')
        .clear()
        .type('The Data I entered here is for testing purposes only')
        .wait(600)
        .should('have.value', 'The Data I entered here is for testing purposes only')

      //verify Error Text 3 - Please provide more information about this termination request should not be visible 
      cy.get('form > div.space-y-6 > div:nth-child(4) > div > div')
        .should('not.exist')
      
      //Then Finally I click the Request for Termination button
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].RequestForTerminationButton)
        .click()
        .wait(3000)

      ///// REQUIRED FIELDS ASSERTIONS ENDS HERE /////////

      //verify alert-success modal popup
      cy.get('div.overflow-y-auto > div.min-h-full')
        .should('exist')
        .within(()=>{
          //assert check logo
          cy.get(' > div > div > svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //check color
          //assert message
          cy.get(' > div > div')
            .should('exist')
            .and('have.text', 'Your termination request has been sent to the approver.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
        })

      //then simulate pressing esc key in your keyboard
      cy.get('body').type('{esc}');
      cy.wait(3000)

      //verify that the Terminate link button becomes Termination Ongoing
      cy.get('div.main-content-inner2 > div > div > p')
        .should('exist')
        .and('have.text', 'Termination Ongoing')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  // text color
        .and('have.css', 'background-color', 'rgb(255, 175, 175)')  // background color that forms like a capsule
        .and('have.css', 'border-radius', '40px')  // the curve edge of the background color

      //Go to Client > For Termination Folder
      //verify FOR Termination link text folder
      cy.get(linktextfolders.CLIENTmodules[0].ForTermination_linktextFolder)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'For Termination')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default text color
        .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(156, 163, 175)') //its star icon verification
        
      //Click the FOR Termination Link text folder
      cy.get(linktextfolders.CLIENTmodules[0].ForTermination_linktextFolder)
        .click()
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') // text color
        .find('svg').should('have.css', 'color', 'rgb(239, 68, 68)') //text color
      
      //verify correct destination page url
      cy.url().should('contain', '/clients/fortermination')
        
      ////// FOR TERMINATION > REQUESTS TAB > TABLE LISTS ASSERTIONS STARTS HERE ///////////

      //verify Column Names
      const expected_columnNames = [
        'Client Name',
        'Service',
        'Brand Strategist',
        'Contract Signed',
        'Submission Date',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option)
          .should('exist')
          .and('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .and('have.css', 'color', 'rgb(190, 190, 190)') // text color
          .and('have.css', 'font-weight', '700')  //font bold
          cy.log(expected_columnNames[index]) 
      });

      // I intentionally click the Submission Date column name in order to go to row 1 the recently send for approval test client
      cy.get('table > thead > tr > th:nth-child(5)')
        .click()
        .wait(2000)

      //Then assert Row 1 each columns in the table
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Client Name
        GETClientName.then(()=>{
          terminationTablelist.verifyrow1column1ClientName(' > td:nth-child(1) > a', clientName)
        })
        //assert Column 2 > Service
        GETClientService.then(()=>{
          terminationTablelist.verifyrow1column2Service(' > td:nth-child(2)', ClientService)
        })
        //assert Column 3 > Brand Strategist
        terminationTablelist.verifyrow1column3BrandStrategist(' > td:nth-child(3) > div', 'JG', 'Jean Gray')
        //assert Column 4 > Contract Signed
        GETActivationDate.then(()=>{
          terminationTablelist.verifyrow1column4ContractSigned(' > td:nth-child(4)', ClientActivationDate)
        })
        //assert Column 5 > Submission Date
        terminationTablelist.verifyrow1column5SubmissionDate(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Column 6 > Action:View
        terminationTablelist.verifyrow1column6Action(' > td:nth-child(6) > button', 'not.be.disabled', 'View')
      })
        
      ////// FOR TERMINATION > REQUESTS TAB > TABLE LISTS ASSERTIONS ENDS HERE ///////////

      //Then here I click the View button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > button')
        .click()
        .wait(3000)

      //verify Termination Request modal popup open
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].modal)
        .should('exist')

      ///////// TERMINATION REQUEST MODAL ELEMENTS ASSERTIONS STARTS HERE ////////

      //verify modal title
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].modaltitle)
        .should('exist')
        .and('have.text', 'Termination Request')
        .and('have.css', 'font-weight', '700')  //font bold
        .and('have.css', 'font-size', '25px')

      //verify Client Name
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].clientname)
        .should('exist')
        .then((txt)=>{
          GETClientName.then(()=>{
            expect(txt.text().trim()).to.equal(`For ${clientName}`)
          })
        }) 

      //verify Reason for Termination Label and Select Menu
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].ReasonForTerminationLabelandSelectMenu)
        .should('exist')
        .within(()=>{
          //assert Reason for Termination Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Reason for termination')
            .and('have.css', 'color', 'rgb(107, 114, 128)') // text color
          //assert the select menu and that it is expected it shows on top the previously selected reason
          cy.get('select option:selected')
            .should('have.text', 'Design Issues')
          //assert the rest of the list since at this point, i can still select or make changes
          cy.get(' > div > select[name="reason"]')
            .should('exist')
            .and('not.be.disabled')
            const viewlistofReasons = [
              'PPC Issues',
              'Communication Issues',
              'Design Issues',
              'Writing Issues',
              'Poor Sales Growth',
              'Amazon Listing Restriction',
              'Lack of Reporting/Strategies',
              'Not profitable - No ROI with SI',
              'SI Terminated',
              'Change of Agency',
              'Ceasing Amazon Channel',
              'SI Delays',
              'Created In-house Team',
              'Contract Fulfilled'
            ]
            cy.get(' > div > select[name="reason"] > option').each(($option, index)=>{
              cy.wrap($option)
                .should('exist')
                .and('not.be.disabled')
                .and('have.text', viewlistofReasons[index])
              cy.log(viewlistofReasons[index])
            })
        })

      //verify Retentiion Effort Checklist Label and the selected retention
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].RetentionEffortChecklistLabelandTheSelectedRetention)
        .should('exist')
        .within(()=>{
          //assert Retention Effort Checklist Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Retention Effort Checklist')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the check logo
          cy.get(' > ul > li > svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 186, 136)') //text color
          //assert the selected retention
          cy.get(' > ul > li > span')
            .should('exist')
            .and('have.text', 'Addressed and resolve issues promptly.')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
        })
      
      //verify Additional Notes Label and the Note
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].AdditionalNotesLabelandTheNotes)
        .should('exist')
        .within(()=>{
          //assert Additional Notes Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Additional Notes')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert the textarea field and it should be disabled
          cy.get(' > div > textarea[name="moreInformation"]')
            .should('exist')
            .and('be.disabled')
            .and('have.text', 'The Data I entered here is for testing purposes only')
        })

      //verify Deny Button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].DenyButton)
        .should('exist')
        .and('have.text', 'Deny')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'background-color', 'rgb(195, 0, 0)') //background color
        .and('have.css', 'border-radius', '40px')

      //verify Approve Button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].ApproveButton)
        .should('exist')
        .and('have.text', 'Approve')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'background-color', 'rgb(0, 186, 136)') //background color
        .and('have.css', 'border-radius', '40px')

      ///////// TERMINATION REQUEST MODAL ELEMENTS ASSERTIONS ENDS HERE ////////

/*

      //// REQUESTS TAB TABLE LIST COLUMN NAMES ASSERTIONS STARTS HERE ///////////
      
      //// REQUESTS TAB TABLE LIST COLUMN NAMES ASSERTIONS ENDS HERE ///////////
      //// REQUESTS TAB TABLE LIST CLIENT TERMINATION REQUESTS ASSERTIONS STARTS HERE /////////// 

        //just to be sure as sometimes when there is event happened, it is usually updated in row 1 of the table but right now, today, it did not. so
        //just to be sure, i have to find the client name the one that I requested a termination
      cy.get('table > tbody > tr').its('length').then((rowCount) => {
        cy.log(`Total rows in the table: ${rowCount}`);
        
        for (let i = 0; i < rowCount; i++) {
          cy.get('table > tbody > tr').eq(i).within(() => {
            // Within each row, find the text in the first column (td)
            cy.get('td:eq(0)').invoke('text').then((columnText) => {
              if (columnText.includes(currentclientname)) {
                // Do something when the specific text is found in the row
                cy.log(`Found ${currentclientname} in row ${i}`);
                //return false; // This breaks out of the .each() loop if client name is found
                  //assert row 1 column 1 Client Name   
                terminationTablelist.verifyrow1column1ClientName('a', currentclientname)
                  //assert row 1 column 2 Service Name clientnameservice
                terminationTablelist.verifyrow1column2Service(' > td:nth-child(2)', clientnameservice)
                  //assert row 1 column 3 Brand Strategist full Name
                terminationTablelist.verifyrow1column3BrandStrategist(' > td:nth-child(3) > div > span', 'peter jackson')
                  //assert row 1 column 4 Client Contract Signed Date 
                terminationTablelist.verifyrow1column4ContractSigned(' > td:nth-child(4)', activationDate)
                  //assert row 1 column 5 Submission Date
                terminationTablelist.verifyrow1column5SubmissionDate(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
                  //assert row 1 column 6 Action View button
                terminationTablelist.verifyrow1column6Action(' > td:nth-child(6) > button', 'not.be.disabled', 'View')

                  //i am going to click the view button
                cy.click_link_button(' > td:nth-child(6) > button')
                  .wait(2000)
              }
            });
          });
        }
      });
      ///// TERMINATION REQUEST MODAL ASSERTIONS STARTS HERE ////
        //verify that the Termination Request modal popup open
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].modal)
        .should('exist')
        .and('be.visible')

        //verify in the Termination Request modal the client name
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].clientname)
        .should('exist')
        .and('be.visible')
        .then((clientN)=>{
          expect(clientN.text().trim()).to.equal('For '+currentclientname)
        })

        // Get a list of all options within the dropdown - this wll verify that the selected option is displayed as selected on top
        // during the creation of the termination request, I choosed the Design Issues which is in number 3 of the list of Reason for Termination, therefore
        // I will verify that the index is in 2.
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].selectreasondropdownmenu).find('option').then((options) => {
            // Find the selected option
        const selectedOption = options.filter(':selected');
            // Check if the selected option is the first option in the list
        expect(selectedOption.index()).to.equal(2);
      })

        //verify that the selected retention appeared in the Termination Request modal
      cy.get('form > div.space-y-6 > div:nth-child(2) > ul > li')
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Provided a seamless onboarding process.')
        .then((el)=>{
          const computedStyle = getComputedStyle(el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1');
        })
        //verify also the check mark beside the selected retention
      cy.get('form > div.space-y-6 > div:nth-child(2) > ul > li > svg')
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(0, 186, 136)')  //check mark color

        //verify the Additional Notes I provided when I was creating the Termination Request 
      cy.get('form > div.space-y-6 > div:nth-child(3) > div > textarea')
        .should('exist')
        .and('be.visible')
        .and('have.text', 'This is just a test for Termination Request.')
      ///// TERMINATION REQUEST MODAL ASSERTIONS ENDS HERE ////
        */

      //// REQUESTS TAB TABLE LIST CLIENT TERMINATION REQUESTS ASSERTIONS ENDS HERE ///////////   **/
    })
    it("Testcase ID: CT0002 - Deny Termination Request for a Client",()=>{

      let GETClientService;
      let ClientService;
      let GETClientName;
      let clientName;
      let GETActivationDate;
      let ClientActivationDate;


      //login using account specialist
      cy.userloginaccount(loginmoduledata.cssSelectors[0].emailaddressInputfield, loginmoduledata.cssSelectors[0].passwordInputfield, loginmoduledata.cssSelectors[0].submitButton, useraccountdata.accountspecialist1, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //click the Client module nav link
      cy.get(BSmodulesnavlink.clientsnavlink)
        .click()
        .wait(3000)

      //GET the client Service of the test client in the last row in page 1 at column 2; can be found in the table at column 2
      GETClientService = new Promise((resolve)=>{
        cy.get('table > tbody > tr:last-child > td:nth-child(2)').then((textName)=>{
          ClientService = textName.text().trim()
          resolve();
        })
      })
      
      //Then I will select that last row in page 1 the test client 
      cy.get('table > tbody > tr:last-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //GET client name H1 title
      GETClientName = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[0].clientNameHeaderTitle).then((cName)=>{
          clientName = cName.text().trim();
          resolve();
        })
      })
      
      //click the billing tab
      cy.get(clientmoduledata.cssSelectors[1].BillingTabLink)
        .click()
        .wait(1000)

      //GET the Activation Date
      GETActivationDate = new Promise((resolve)=>{
        cy.get(clientmoduledata.cssSelectors[1].SubscriptionsPage[0].OverviewSection[0].ActivationDate).then((date)=>{
          ClientActivationDate = date.text().trim();
          resolve();
        })
      })

      //verify there is Terminate link if Found then click
      cy.get(clientmoduledata.cssSelectors[1].TerminateLink)
        .click()
        .wait(2000)
        
      //verify that the Termination Request modal popup open
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].modal)
        .should('exist')

      ///// PROCESS TERMINATION REQUEST STARTS HERE /////////

      //select one Reason for Termination
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].ReasonForTerminationLabelandSelectMenu)
        .find(' > div > select[name="reason"]')
        .select('Design Issues')
        .wait(700)
        .should('have.value','Design Issues')
        
      //verify that the selected reason goes on top
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].ReasonForTerminationLabelandSelectMenu)
        .find('select option:selected')
        .should('have.text', 'Design Issues')
      
      //Select 1 Retention Effort at Checklist - Addressed and resolve issues promptly.
      cy.get('form > div.space-y-6 > div:nth-child(3) > div > div:nth-child(3) > input[name="retentionEffortCheckList"]')
        .check()
        .wait(600)
        .should('be.checked')

      //Enter Data on Additional Notes Textarea field
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].AdditionalNotesLabelandTextareafield)
        .find(' > div > textarea[name="moreInformation"]')
        .clear()
        .type('The Data I entered here is for testing purposes only')
        .wait(600)
        .should('have.value', 'The Data I entered here is for testing purposes only')

      //click the Request for Termination button
      cy.get(clientmoduledata.cssSelectors[1].TerminationRequestModal[0].RequestForTerminationButton)
        .click()
        .wait(3000)

      ///// PROCESS TERMINATION REQUEST ENDS HERE /////////

      //verify alert-success modal popup
      cy.get('div.overflow-y-auto > div.min-h-full')
        .should('exist')
        .within(()=>{
          //assert check logo
          cy.get(' > div > div > svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //check color
          //assert message
          cy.get(' > div > div')
            .should('exist')
            .and('have.text', 'Your termination request has been sent to the approver.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
        })

      //then simulate pressing esc key in your keyboard
      cy.get('body').type('{esc}');
      cy.wait(3000)

      //verify that the Terminate link button becomes Termination Ongoing
      cy.get('div.main-content-inner2 > div > div > p')
        .should('exist')
        .and('have.text', 'Termination Ongoing')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  // text color
        .and('have.css', 'background-color', 'rgb(255, 175, 175)')  // background color that forms like a capsule
        .and('have.css', 'border-radius', '40px')  // the curve edge of the background color
      
      //Click the FOR Termination Link text folder
      cy.get(linktextfolders.CLIENTmodules[0].ForTermination_linktextFolder)
        .click()
        .wait(1000)

      //verify correct destination page url
      cy.url().should('contain', '/clients/fortermination')

      // I intentionally click the Submission Date column name in order to go to row 1 the recently send for approval test client
      cy.get('table > thead > tr > th:nth-child(5)')
        .click()
        .wait(1000)

      //select row 1 for termination request and click its view button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > button')
        .click()
        .wait(1000)

      //verify Termination Request modal popup
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].modal)
        .should('exist')

      //Click the Deny Button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].DenyButton)
        .click()
        .wait(1000)

      //verify Let the requestor know why are you denying the request text
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].LetTheRequestorKnowWhyAreYouDenyingTheRequestTEXT)
        .should('exist')
        .and('have.text', 'Let the requestor know why are you denying the request')
        .and('have.css', 'font-weight', '700') // font bold

      //verify Reason for Denying Label and textarea field
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].ReasonForDenyingLabelandTextarea)
        .should('exist')
        .within(()=>{
          //assert Reason for Denying Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Reason for denying:')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
          //assert textarea field
          cy.get(' > div > textarea[name="denyReason"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
        })
      
      //verify GO back button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].GobackButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Go Back')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
        .and('have.css', 'font-weight', '700') // font bold

      //verify Submit button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].SubmitButton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Submit')
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'font-weight', '700') // font bold
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color
        .and('have.css', 'border-radius', '40px')

      ////////// REQUIRED ASSERTIONS STARTS HERE /////////////////

      //without fill up reason, click the submit button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].SubmitButton)
        .click()
        .wait(2000)

      //verify that the Termination Request modal should remain open
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].modal)
        .should('exist')

      //verify Error Text - Reason for denying is required.
      cy.get('form > div.space-y-6 > div:nth-child(2) > div > div')
        .should('exist')
        .and('have.text', 'Reason for denying is required.')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Enter Reason for Denying 
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].ReasonForDenyingLabelandTextarea)
        .find(' > div > textarea[name="denyReason"]')
        .clear()
        .type('This client will be denied for testing purposes only')
        .wait(600)
        .and('have.value', 'This client will be denied for testing purposes only')

      //verify Error Text - Reason for denying is required. -  should not be visible
      cy.get('form > div.space-y-6 > div:nth-child(2) > div > div')
        .should('not.exist')

      //Click the Submit button
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].SubmitButton)
        .click()
        .wait(3000)

      ////////// REQUIRED ASSERTIONS ENDS HERE /////////////////

      //verify alert-success message modal popup
      cy.get('div.overflow-y-auto > div.min-h-full')
        .should('exist')
        .within(()=>{
          //assert check logo
          cy.get(' > div > div > svg')
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 47, 93)') //text color
          //assert message
          cy.get(' > div > div')
            .should('exist')
            .and('have.text', 'The requestor has been notified about the denial of the termination request.')
            .and('have.css', 'color', 'rgb(0, 47, 93)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
        })

      //then simulate pressing esc key in your keyboard
      cy.get('body').type('{esc}');
      cy.wait(3000)
        
      //go to Client > For Termination > Denied tab
      //verify there is Denied tab - if Found, then click
      cy.get(clientmoduledata.cssSelectors[2].CLIENT_FORTERMINATION[0].PageTabs[0].DeniedTab)
        .should('exist')
        .and('have.text', 'Denied')
        .and('have.css', 'color', 'rgb(148, 148, 148)') //default text color
        .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
        .and('have.css', 'font-weight', '700')  //font bold
        .click()
        .wait(2000)
        .should('have.css', 'color', 'rgb(24, 121, 216)') //the changed text color
        .and('have.css', 'font-weight', '700')  //font bold

      //verify url expected destination
      cy.url().should('contain', '/clients/fortermination/denied')

      // I intentionally click the Submission Date column name in order to go to row 1 the recently send for approval test client
      cy.get('table > thead > tr > th:nth-child(5)')
        .click()
        .wait(1000)

      /////// DENIED TAB > TABLE LISTS ASSERTIONS STARTS HERE ////////////

      //verify the column names
      const expected_columnNames = [
        'Client Name',
        'Service',
        'Brand Strategist',
        'Contract Signed',
        'Submission Date',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option)
          .should('exist')
          .and('have.text', expected_columnNames[index])  //verify names based on the expected names per column
          .and('have.css', 'color', 'rgb(190, 190, 190)') // text color
          .and('have.css', 'font-weight', '700')  //font bold
          cy.log(expected_columnNames[index]) 
      });

      //Then verify the row 1 each columns - because that is the one that recently denied earlier
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert Column 1 > Client Name
        GETClientName.then(()=>{
          terminationTablelist.verifyrow1column1ClientName(' > td:nth-child(1) > a', clientName)
        })
        //assert Column 2 > Service
        GETClientService.then(()=>{
          terminationTablelist.verifyrow1column2Service(' > td:nth-child(2)', ClientService)
        })
        //assert Column 3 > Brand Strategist
        terminationTablelist.verifyrow1column3BrandStrategist(' > td:nth-child(3) > div', 'JG', 'Jean Gray')
        //assert Column 4 > Contract Signed
        GETActivationDate.then(()=>{
          terminationTablelist.verifyrow1column4ContractSigned(' > td:nth-child(4)', ClientActivationDate)
        })
        //assert Column 5 > Submission Date
        terminationTablelist.verifyrow1column5SubmissionDate(' > td:nth-child(5) > span', utilfunc.getFormattedDate())
        //assert Column 6 > Action:View
        terminationTablelist.verifyrow1column6Action(' > td:nth-child(6) > button', 'not.be.disabled', 'View')
      })

      /////// DENIED TAB > TABLE LISTS ASSERTIONS ENDS HERE ////////////

      //Click the View button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > button')
        .click()
        .wait(2000)

      //verify Termination Request modal popup
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].modal)
        .should('exist')

      //verify there is YOur termination request was denied section and within its elements
      cy.get(clientmoduledata.cssSelectors[1].View_TerminationRequestModal[0].YourTerminationRequestWasDeniedSection)
        .should('exist')
        .within(()=>{
          //assert Your termination request was denied text
          cy.get(' > p:nth-child(1)')
            .should('exist')
            .and('have.text', 'Your termination request was denied')
            .and('have.css', 'color', 'rgb(239, 68, 68)') // text color
            .and('have.css', 'font-weight', '700')  //font bold
          //assert Reason for deny Label
          cy.get(' > label')
            .should('exist')
            .and('have.text', 'Reason for deny')
            .and('have.css', 'color', 'rgb(107, 114, 128)') // text color
          //assert the Entered Reason for deny data
          cy.get(' > p:nth-child(3)')
            .should('exist')
            .and('have.text', 'This client will be denied for testing purposes only')
        })

      //then simulate pressing esc key in your keyboard
      cy.get('body').type('{esc}');
      cy.wait(3000)

      //I will click the client name in row 1 column 1 to go to its profile page
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .click()
        .wait(2000)

      //verify the Termination Ongoing goes back as Terminate link
      cy.get(clientmoduledata.cssSelectors[1].TerminateLink)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Terminate')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  // text color
        .and('have.css', 'font-weight', '700')  // font bold

/*
       
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
        .then((txt)=>{
          clientName = txt.text().trim();
        })
        .invoke('attr', 'href')
        .then((href)=>{
          clientnameurl = href;
          cy.log('this is the current client url =  '+clientnameurl);
        })

        //at the Denied table I will search for the client name of the denied request in the table
      cy.get('table > tbody > tr').its('length').then((rowCount) => {
          cy.log(`Total rows in the table: ${rowCount}`);
          
          for (let i = 0; i < rowCount; i++) {
            cy.get('table > tbody > tr').eq(i).within(() => {
              // Within each row, find the text in the first column (td)
              cy.get('td:eq(0)').invoke('text').then((columnText) => {
                if (columnText.includes(clientName)) {
                  // Do something when the specific text is found in the row
                  cy.log(`Found ${clientName} in row ${i}`);
                  //then i am going to click the view button under the row
                  cy.get('td button').click();
                  //return false; // This breaks out of the .each() loop if client name is found
                }
              });
            });
          }
      });  
      
    })
    it("Testcase ID: CT0003 - Approve Termination Request for a Client",()=>{

      let currentclientname;
      let activationDate;
      let GETClientname;
      let clienturlforpagination;



        //calling utility functions
      const utilfunc = new utilityfunctions();

      //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)
 
          // I will select the last test client in the table list of the 1st page
      cy.click_link_button('table > tbody > tr:last-child > td:nth-child(1) > a')
        .wait(2000)

          //GET current client name as the H1 title
      GETClientname = new Promise((resolve)=>{
        cy.get(clientmodules.testclientpagemaintitle)
          .then((textName)=>{
            currentclientname = textName.text().trim()
            resolve();
          })
      })
 
        //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

        //get the Activation Date
      cy.get(clientmodules.billingtab[1].overview[0].activationdate)
        .wait(2000)
        .then((date)=>{
          activationDate = date.text().trim();
          cy.log(" CLIENT'S ACTIVATION DATE > "+activationDate)
        })
          
          //click the Terminate link button
      cy.click_link_button(clientmodules.terminate[0].terminatelinkbutton)
        .wait(2000)

          //verify that the Termination Request modal popup open
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].modal)
        .should('exist')
        .and('be.visible')

      ///// CREATE TERMINATION REQUEST STARTS HERE /////////
        
          //select a reason for termination
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].selectreasondropdownmenu).select('Design Issues').should('have.value','Design Issues')
        .wait(2000)

          //Select at least 1 Retention Checklist
      cy.click_link_button('form > div.space-y-6 > div:nth-child(3) > div.space-y-3 > div:nth-child(1) > input')
        .wait(2000)
        .check().then(($checkbox) => {
          expect($checkbox).to.be.checked;  //assert that the checkbox of the 1st retention checklist is checked
        });

          //Add/Type Additional
      cy.type_enter_data(clientmodules.terminate[0].terminaterequestmodal[0].additionalnotestextareafield, 'This is just a test for Termination Request.')
        .wait(2000)
        .should('have.value', 'This is just a test for Termination Request.')

          //click the Request for Termination button
      cy.click_link_button(clientmodules.terminate[0].terminaterequestmodal[0].requestforterminationbutton)
        .wait(2000)

          //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
            //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Your termination request has been sent to the approver.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
            //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

          //this simulate pressing the esc keyboard to close the alert-success modal
          //choosing the body as the selector it means global
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(3000)
      ///// CREATE TERMINATION REQUEST ENDS HERE /////////
          
        //go to Client > For Termination > Requests Tab
      cy.click_link_button(clientmodules.clientmodulesubfolderslink[0].fortermination)
      .wait(2000)

        // i will then find the client name in the table
      cy.get('table > tbody > tr').its('length').then((rowCount) => {
          cy.log(`Total rows in the table: ${rowCount}`);
        
          for (let i = 0; i < rowCount; i++) {
            cy.get('table > tbody > tr').eq(i).within(() => {
                // Within each row, find the text in the first column (td)
              cy.get('td:eq(0)').invoke('text').then((columnText) => {
                //calling the GET promise - > resolve functions and inside is the if-statement in comparing the client name on each rows column 1
                GETClientname.then(()=>{
                  if (columnText.includes(currentclientname)) {
                    // Do something when the specific text is found in the row
                    cy.log(`Found ${currentclientname} in row ${i}`);
                    //I will have to get the url of this client to be terminated to be used later  
                    cy.get('td a')
                      .invoke('attr', 'href')
                      .then((href)=>{
                        clienturlforpagination = href;
                        cy.log('this is what I need -> '+clienturlforpagination)
                      })
                    //then i am going to click the view button under the row
                    cy.get('td button').click();
                    //return false; // This breaks out of the .each() loop if client name is found
                  }
                }) 
              });
            });
          }
      });  
          
      //verify that the Termination Request modal popup open
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].modal)
        .should('exist')
        .and('be.visible')

          //verify Approve button
      cy.get(clientmodules.terminate[0].terminaterequestmodal[0].approvebutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Approve')
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'background-color', 'rgb(0, 186, 136)') //background colort that form into like a capsule
        .and('have.css', 'border-radius', '40px') //the curve edge of the background-color
   
          //click the Approve button
      cy.click_link_button(clientmodules.terminate[0].terminaterequestmodal[0].approvebutton)
        .wait(2000)

          //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
            //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The client has been successfully terminated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
            //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
          
          // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
        
          //I will also go to Inactive Clients and expect the client to be there in the table
      cy.click_link_button(clientmodules.clientmodulesubfolderslink[0].inactiveclients)
        .wait(2000)

        // I will find this recently terminated client if it is here as expected and when i do I will open its profile page
      cy.get('table > tbody > tr').then(()=>{
        //calling again the GET Promise - > resolve function for finding the client name at the Client > Inactive Clients per page
        GETClientname.then(()=>{  //currentclientname
          searchNameInTable(currentclientname); 
        })     
      })

      //then visit the client profile page; GetclientURL
      cy.get('body').then(()=>{
          cy.log('The part of the url -> '+clienturlforpagination);
          cy.visit('https://agency.test.better-seller.betterseller.com'+clienturlforpagination).wait(3000);
      })
      
      //verify the what was used to be a terminate link button is now 'Terminated last yyyy-mm-dd
      cy.get('div.main-content-inner2 > div > div p.text-error-dark')
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  //text color
        .and('have.css', 'background-color', 'rgb(255, 175, 175)')  // the background color that shape like a capsule
        .and('have.css', 'border-radius', '40px')
        .and('have.text', 'Terminated last '+utilfunc.getFormattedDateYearMonthDay())  
    })
    // **** CLIENTS TERMINATION ENDS HERE ***
    // **** CLIENTS ADMIN TASK MANAGEMENT STARTS HERE ***
    it("Testcase ID: CATM0001 - Create Task Management Onboarding Template for New Onboarded client",()=>{


      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //verify the Admin Module nav link
      cy.get(clientmodulesnavlink.adminnavlink)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.css', 'color', 'rgb(255, 255, 255)')  // default text color > white
        .find('svg')
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(255, 255, 255)')  // default text color > white

      //Now as I hover and click the Admin nav link - I will assert that the text color becomes red and with a background color white
      cy.get(clientmodulesnavlink.adminnavlink)
        .realHover().click().wait(2000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') //the text color changes to red
        .and('have.css', 'background-color', 'rgb(255, 255, 255)')  //background color
        .find('svg')
          .should('exist')
          .and('be.visible')
          .and('have.css', 'color', 'rgb(239, 68, 68)')  // the text color changes to red
      
      //verify the module title above the Link text folders
      cy.get(adminmodule.titlemodule)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Admin')
        .and('have.css', 'font-weight', '700')  // font bold
        .and('have.css', 'color', 'rgb(102, 102, 102)') // text color
        .then((txt)=>{
          const computedStyle = getComputedStyle(txt[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1');
        })

      //i will also verify the expected url destination '/employees' ; because by default when a user clicks on the Admin module nav, it will go to Employees folder link page
      cy.url().should('contain', '/employees')

      //I will verify the Task Management folder link
      cy.get(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Task Management')
        .and('have.css', 'color', 'rgb(156, 163, 175)')  //default text color
        .then((txt)=>{
          const computedStyle = getComputedStyle(txt[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1');
        })
        .find('svg')
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.css', 'color', 'rgb(156, 163, 175)')  //default text color
          .then((txt)=>{
            const computedStyle = getComputedStyle(txt[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1');
          })

      //now I am going to click the Task Management folder link and then verify that it should change the text color
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(1000)
        .should('have.css', 'color', 'rgb(239, 68, 68)') //the text color changes to red
        .find('svg')
          .should('have.css', 'color', 'rgb(239, 68, 68)') //the text color changes to red

      //verify the url destination as it should go to /task-management/templates
      cy.url().should('contain', '/task-management/templates')

      //verify also the Task Management Page Title
      cy.get(adminmodule.TaskManagementFolder[0].titlepage)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Task Management')
        .and('have.css', 'font-weight', '700')  // font bold

      //verify Add button next to Task Management Title
      cy.get(adminmodule.TaskManagementFolder[0].Addbutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Add')
        .and('have.css', 'font-weight', '700')  // font bold
        .and('have.css', 'color', 'rgb(0, 47, 93)')  //default text color
        .and('have.css', 'border-color', 'rgb(0, 47, 93)')  //outline color like a capsule
        .and('have.css', 'border-radius', '40px') //the curve edge of the button

      //I will click the add button and expect a Task List Creation - Select a Template to start with modal popup
      cy.click_link_button(adminmodule.TaskManagementFolder[0].Addbutton)
        .wait(2000)

      //verify the Task List Creation - Select a Template to start with modal popup
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
        .should('exist')
        .and('be.visible')

      //verify inside the Task List Creation - Select a Template to start with modal
      /////// Task List Creation - Select a Template to start with Elements Assertions Starts here /////////
      //Verify Task List Creation modal main title
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TaskListCreationTitle)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Task List Creation')

      //verify Select a Template to Start With title
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].SelectaTemplatetoStartWithTitle)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Select a Template to start with')
        .and('have.css', 'font-weight', '700')  // font bold

      //verify onboarding template
      //isSelected default
      //title - Onboarding
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onboardingTemplate)
        .should('exist')
        .and('be.visible')
        .and('have.css', 'border-color', 'rgb(24, 121, 216)')  //verify that there is a border-color that surrounds the entire onboarding template, which also signify that it is selected
        .then(()=>{
          //verify that there is a dot with the color of blue that signify as selected
          cy.get('form > div > div:nth-child(1) > div:nth-child(1) > div > div')
            .should('exist')
            .and('be.visible')
            .and('have.css', 'background-color', 'rgb(24, 121, 216)') // the color of the dot
          //verify the title is Onboarding
          cy.get('form > div > div:nth-child(1) > div:nth-child(1) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Onboarding')
          //verify that the entire template has also a background image
          cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onboardingTemplate)
            .find('img')
              .should('exist')
              .and('be.visible')
              .should('attr', 'src')
              .should('include', '/assets/tasks-templates/onboarding.png')
        })

      //verify recurring template
      //title - Recurring
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].recurringTemplate)
        .should('exist')
        .and('be.visible')
        .and('have.css', 'border-color', 'rgb(190, 190, 190)') // it means it is not yet selected; default color
        .then(()=>{
          //verify title
          cy.get('form > div > div:nth-child(1) > div:nth-child(3) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Recurring')
        })

      //verify One Time template
      //title - One Time
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onetimeTemplate)
        .should('exist')
        .and('be.visible')
        .and('have.css', 'border-color', 'rgb(190, 190, 190)') // it means it is not yet selected; default color
        .then(()=>{
          //verify title
          cy.get('form > div > div:nth-child(1) > div:nth-child(4) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'One Time')
        })
      
      //verify Next button
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Next')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //text color
        .and('have.css', 'background-color', 'rgb(30, 58, 138)') //the color that shape like a capsule
        .and('have.css', 'border-color', 'rgb(30, 58, 138)') //outline color of the background color
        .and('have.css', 'border-radius', '9999px') // the curve edge of the background color
      /////// Task List Creation - Select a Template to start with Elements Assertions Ends here /////////

      //This is where i click the next button since the Onboarding template is by default already selected
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
        .wait(2000)

      //I will then verify on the same modal that there are sets of elements to be expected after I click the Nex button
      ///// Customize your onboarding template assertions starts here ///////
      
      //Verify Task List Creation modal Customize your onboarding template title
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].SelectaTemplatetoStartWithTitle)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Customize your onboarding template')

      //verify Template Name input field and its label
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify label > Template Name*
          cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
            .find('label')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Template Name*')
            .find('sup')
              .should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
            .then((txt)=>{
              const computedStyle = getComputedStyle(txt[0])
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1');
            })
          //verify Template Name Input Field
          cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
            .find('> input')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
        })
        
        //verify the Partner Type label and its drop down menu
        cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].PartnerTypeLabelandDropdownmenu)
          .should('exist')
          .and('be.visible')
          .then(()=>{
            //verify the Partner Type label
            cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].PartnerTypeLabelandDropdownmenu)
            .find('label')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Partner Type *')
            .find('sup')
              .should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
            .then((txt)=>{
              const computedStyle = getComputedStyle(txt[0])
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1');
            })
            //verify the Partner Type Drop down menu
            const PartnerTypeOptions = [
              'Choose One',
              'New',
              'Existing'
            ];
            cy.get('form > div > div:nth-child(2) > div > select')
              .should('exist')
              .and('be.visible')
              .then(()=>{
                cy.get('form > div > div:nth-child(2) > div > select > option').each(($option, index)=>{
                  cy.wrap($option).should('have.text', PartnerTypeOptions[index]) //verify names based on the expected options
                    .should('exist')
                    .and('not.be.disabled')
                    cy.log(PartnerTypeOptions[index]) 
                })
              })
            //also i will verify that by default, it is choose One is pre-selected
            cy.get('form > div > div:nth-child(2) > div > select > option').first().should('have.text', 'Choose One');
          })
      
      //Verify Which service category will this be used? label and its drop down menu
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].WhichservicecategorywillthisbeusedLabelandDropdownmenu)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify Which service category will this be used? label
          cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].WhichservicecategorywillthisbeusedLabelandDropdownmenu)
            .find('label')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Which service category will this be used? *')
            .find('sup')
              .should('have.css', 'color', 'rgb(237, 46, 46)') //asterisk color
            .then((txt)=>{
              const computedStyle = getComputedStyle(txt[0])
              const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
              expect(customPropertyValue).to.equal('1');
            })
          //verify its drop down menu
          const ServiceCategoryOptions = [
            'Choose One',
            'Full Account Management',
            'PPC Management',
            'Listing Content Creation',
            'Account Health Management',
            'Account Health Issue',
            'Seller Launch',
            'Account Creation',
            'Amazon Traffic Boost',
            'Advertising Management',
            'Google Advertising',
            'Meta Advertising',
            'SEO Management',
            'Website Content',
            'Mailchimp Management',
            'Website Activation'
          ];
          cy.get('form > div > div:nth-child(3) > select')
              .should('exist')
              .and('be.visible')
              .then(()=>{
                cy.get('form > div > div:nth-child(3) > select > option').each(($option, index)=>{
                  cy.wrap($option).should('have.text', ServiceCategoryOptions[index]) //verify names based on the expected options
                    .should('exist')
                    .and('not.be.disabled')
                    cy.log(ServiceCategoryOptions[index]) 
                })
              })
            //also i will verify that by default, it is choose One is pre-selected
            cy.get('form > div > div:nth-child(3) > select > option').first().should('have.text', 'Choose One');
        })

        //verify Back button
        cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].backbutton)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.text', 'Back')
          .and('have.css', 'color', 'rgb(107, 114, 128)') // text color
          .and('have.css', 'border-color', 'rgb(107, 114, 128)') //the border line color that form like a capsule
          .and('have.css', 'border-radius', '9999px') // the curve edge
          .then((txt)=>{
            const computedStyle = getComputedStyle(txt[0])
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1');
          })

        //verify Create button
        cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.text', 'Create')
          .and('have.css', 'color', 'rgb(255, 255, 255)') // text color
          .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color that form like a capsule
          .and('have.css', 'border-color', 'rgb(30, 58, 138)')   //the border line color that form like a capsule
          .and('have.css', 'border-radius', '9999px') // the curve edge
      ///// Customize your onboarding template assertions starts here ///////

      ////// REQUIRED ASSERTIONS STARTS HERE //////////
      //I will click the Create button without supplying any data to any of the required fields
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
        .wait(2000)

      //verify modal popup
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
      .should('exist')
      .and('be.visible')

      //verify error 1 - Template name is required
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText1)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Template name is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color
      //verify error 2 - Partner type is required
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText2)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Partner type is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color
      //verify error 3 - Service category is required
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText3)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Service category is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

      //Now Enter a Template Name
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
        .find('> input')
        .type('New Onboarding '+utilfunc.getFormattedDate())
        .wait(2000)
        .should('have.value', 'New Onboarding '+utilfunc.getFormattedDate())

      //verify again as the Error Text 1 should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText1)
        .should('not.exist')

      //verify again error 2 - Partner type is required
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText2)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Partner type is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color
      //verify again error 3 - Service category is required
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText3)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Service category is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

      //Now select Partner Type - New
      cy.get('form > div > div:nth-child(2) > div > select').select('new').should('have.value','new')
        .wait(1000)

      //verify again as the Error Text 1 should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText1)
        .should('not.exist')

      //verify again error 2 - should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText2)
        .should('not.exist')

      //verify again error 3 - should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText3)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Service category is required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

      //Now select Service Category
      cy.get('form > div > div:nth-child(3) > select').select('Listing Content Creation').should('have.value','Listing Content Creation')
        .wait(1000)

      //verify again as the Error Text 1 should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText1)
      .should('not.exist')

      //verify again error 2 - should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText2)
      .should('not.exist')

      //verify again error 3 - should not be visible
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].ErrorText3)
      .should('not.exist')
   
      //Now Click the Create button
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
        .wait(2000)
      ////// REQUIRED ASSERTIONS ENDS HERE //////////
      
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
            //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Template has been created.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
            //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
          
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will now verify in the New Tab > Onboarding Table
      //////// ONBOARDING TABLE ASSERTIONS STARTS HERE ////////
      //verify that the table has expected columns Names
      const ExpectedColumnNames = [
        'Template Name',
        'Partner Type',
        'Service Type',
        'Last Updated',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index)=>{
        cy.wrap($option).should('have.text', ExpectedColumnNames[index]) //verify names based on the expected options
          .should('exist')
          .and('be.visible')
          .then((txt)=>{
            const computedStyle = getComputedStyle(txt[0])
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1');
          })
        cy.log(ExpectedColumnNames[index]); 
      });

      // THEN, now I will verify the recently created task management that should appear in the New > Onboarding Tab
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', 'New Onboarding '+utilfunc.getFormattedDate())
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      //////// ONBOARDING TABLE ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CATM0002 - Create Task Management Recurring Template for New Onboarded client",()=>{

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(1000)
      
      //I will click the add button and expect a Task List Creation - Select a Template to start with modal popup
      cy.click_link_button(adminmodule.TaskManagementFolder[0].Addbutton)
        .wait(2000)

      //verify the Task List Creation - Select a Template to start with modal popup
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
        .should('exist')
        .and('be.visible')

      //Select Recurring Template
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].recurringTemplate)
        .wait(1000)
        .and('have.css', 'border-color', 'rgb(24, 121, 216)')  //After I click the Recurring Template, there is a blue border-color of blue which signifies that it is now selected
        .then(()=>{
          //verify the dot has now the color of blue that signify also as selected
          cy.get('form > div > div:nth-child(1) > div:nth-child(3) > div > div')
            .should('exist')
            .and('be.visible')
            .and('have.css', 'background-color', 'rgb(24, 121, 216)') // the color of the dot now is blue
          //verify the title is Onboarding
          cy.get('form > div > div:nth-child(1) > div:nth-child(3) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Recurring')
          //verify that the entire template has also a background image
          cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].recurringTemplate)
            .find('img')
              .should('exist')
              .and('be.visible')
              .should('attr', 'src')
              .should('include', '/assets/tasks-templates/recurring.png')
        })

      //Click the Next button
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
        .wait(2000)

      ///////// CREATE RECURRING TASK MANAGEMENT STARTS HERE ///////////////
      //verify modal popup
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
        .should('exist')
        .and('be.visible')

      //Enter a Template Name
      cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
        .find('> input')
        .type('New Recurring '+utilfunc.getFormattedDate())
        .wait(2000)
        .should('have.value', 'New Recurring '+utilfunc.getFormattedDate())

      //Now select Partner Type - New
      cy.get('form > div > div:nth-child(2) > div > select').select('new').should('have.value','new')
        .wait(1000)

      //Now select Service Category
      cy.get('form > div > div:nth-child(3) > select').select('Listing Content Creation').should('have.value','Listing Content Creation')
        .wait(1000)

      //Now Click the Create button
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
        .wait(2000)

      ///////// CREATE RECURRING TASK MANAGEMENT ENDS HERE ///////////////
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Template has been created.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
            

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //Going to Task Management > Recurring Tab
      //Verify Recurring Tab
      cy.get(adminmodule.TaskManagementFolder[0].RecurringTab)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Recurring')
        .and('have.css', 'color', 'rgb(156, 163, 175)') // default color before i click
        .then((txt)=>{
          const computedStyle = getComputedStyle(txt[0])
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1');
        })
          
      //Then I will click the Recurring Tab then verify it should changed the text color
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(2000)
        .should('have.css', 'color', 'rgb(24, 121, 216)') // changed color after i click
        .and('have.css', 'font-weight', '600')  // font bold
          
      //verify url destination expectation
      cy.url().should('contain', 'recurring')

      //////// RECURRING TABLE ASSERTIONS STARTS HERE ////////
      //verify that the table has expected columns Names
      const ExpectedColumnNames = [
        'Template Name',
        'Partner Type',
        'Service Type',
        'Last Updated',
        'Updated By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index)=>{
        cy.wrap($option).should('have.text', ExpectedColumnNames[index]) //verify names based on the expected options
          .should('exist')
          .and('be.visible')
          .then((txt)=>{
            const computedStyle = getComputedStyle(txt[0])
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1');
          })
        cy.log(ExpectedColumnNames[index]); 
      });

      // THEN, now I will verify the recently created task management that should appear in the New > Recurring Tab
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', 'New Recurring '+utilfunc.getFormattedDate())
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      //////// RECURRING TABLE ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CATM0003 - Create Task Management One Time Template for New Onboarded client",()=>{


       //calling utility functions
       const utilfunc = new utilityfunctions();

       //calling AdminTaskManagementTablelist
       const TaskTablelist = new TaskManagementTablelist();
 
       //login using admin role
       cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
       //click the Admin nav module
       cy.click_link_button(clientmodulesnavlink.adminnavlink)
         .wait(2000)
 
       //now I am going to click the Task Management folder link
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(1000)
       
       //I will click the add button and expect a Task List Creation - Select a Template to start with modal popup
       cy.click_link_button(adminmodule.TaskManagementFolder[0].Addbutton)
         .wait(2000)
 
       //verify the Task List Creation - Select a Template to start with modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Select One Time Template
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onetimeTemplate)
         .wait(1000)
         .and('have.css', 'border-color', 'rgb(24, 121, 216)')  //After I click the Recurring Template, there is a blue border-color of blue which signifies that it is now selected
         .then(()=>{
           //verify the dot has now the color of blue that signify also as selected
           cy.get('form > div > div:nth-child(1) > div:nth-child(4) > div > div')
             .should('exist')
             .and('be.visible')
             .and('have.css', 'background-color', 'rgb(24, 121, 216)') // the color of the dot now is blue
           //verify the title is Onboarding
           cy.get('form > div > div:nth-child(1) > div:nth-child(4) > p')
             .should('exist')
             .and('be.visible')
             .and('have.text', 'One Time')
           //verify that the entire template has also a background image
           cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onetimeTemplate)
             .find('img')
               .should('exist')
               .and('be.visible')
               .should('attr', 'src')
               .should('include', '/assets/tasks-templates/one-time.png')
         })
 
       //Click the Next button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
         .wait(2000)
 
       ///////// CREATE ONE TIME TASK MANAGEMENT STARTS HERE ///////////////
       //verify modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Enter a Template Name
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
         .find('> input')
         .type('New One Time '+utilfunc.getFormattedDate())
         .wait(2000)
         .should('have.value', 'New One Time '+utilfunc.getFormattedDate())
 
       //Now select Partner Type - New
       cy.get('form > div > div:nth-child(2) > div > select').select('new').should('have.value','new')
         .wait(1000)
 
       //Now select Service Category
       cy.get('form > div > div:nth-child(3) > select').select('Listing Content Creation').should('have.value','Listing Content Creation')
         .wait(1000)
 
       //Now Click the Create button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
         .wait(2000)
 
       ///////// CREATE ONE TIME TASK MANAGEMENT ENDS HERE ///////////////
       //verify alert-success message popup
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
         .should('exist')
         .and('be.visible')
         .then(()=>{
           //verify the message inside
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
             .should('exist')
             .and('be.visible')
             .and('have.text', 'Template has been created.')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
             .and('have.css', 'font-weight', '400')  //font bold
           //verify check mark logo
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
             .should('exist')
             .and('be.visible')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
         })
             
 
       // I will close the Termination Request modal by pressing the esc key
       cy.get('body').type('{esc}'); // pressing esc button of the keyboard
       cy.wait(2000)
 
       //Going to Task Management > One Time Tab
       //Verify One Time Tab
       cy.get(adminmodule.TaskManagementFolder[0].OneTimeTab)
         .should('exist')
         .and('be.visible')
         .and('not.be.disabled')
         .and('have.text', 'One Time')
         .and('have.css', 'color', 'rgb(156, 163, 175)') // default color before i click
         .then((txt)=>{
           const computedStyle = getComputedStyle(txt[0])
           const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
           expect(customPropertyValue).to.equal('1');
         })
           
       //Then I will click the One Time Tab then verify it should changed the text color
       cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // changed color after i click
         .and('have.css', 'font-weight', '600')  // font bold
           
       //verify url destination expectation
       cy.url().should('contain', 'one-time')
 
       //////// ONE TIME TABLE ASSERTIONS STARTS HERE ////////
       //verify that the table has expected columns Names
       const ExpectedColumnNames = [
         'Template Name',
         'Partner Type',
         'Service Type',
         'Last Updated',
         'Updated By',
         'Action'
       ];
       cy.get('table > thead > tr > th').each(($option, index)=>{
         cy.wrap($option).should('have.text', ExpectedColumnNames[index]) //verify names based on the expected options
           .should('exist')
           .and('be.visible')
           .then((txt)=>{
             const computedStyle = getComputedStyle(txt[0])
             const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
             expect(customPropertyValue).to.equal('1');
           })
         cy.log(ExpectedColumnNames[index]); 
       });
 
       // THEN, now I will verify the recently created task management that should appear in the New > One Time Tab
       cy.get('table > tbody > tr:first-child').within(()=>{
         //assert column1 > Template Name
         TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', 'New One Time '+utilfunc.getFormattedDate())
         //assert column2 > Partner Type
         TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
         //assert column3 > Service Type
         TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
         //assert column4 > Last Updated
         TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
         //assert column5 > Updated By
         TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
         //assert column6 > Action:Edit
         TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
       })
       //////// ONE TIME TABLE ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CATM0004 - Create Task Management Onboarding Template for Existing client",()=>{


       //calling utility functions
       const utilfunc = new utilityfunctions();

       //calling AdminTaskManagementTablelist
       const TaskTablelist = new TaskManagementTablelist();
 
       //login using admin role
       cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
       //click the Admin nav module
       cy.click_link_button(clientmodulesnavlink.adminnavlink)
         .wait(2000)
 
       //now I am going to click the Task Management folder link
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(1000)
       
       //I will click the add button and expect a Task List Creation - Select a Template to start with modal popup
       cy.click_link_button(adminmodule.TaskManagementFolder[0].Addbutton)
         .wait(2000)
 
       //verify the Task List Creation - Select a Template to start with modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Since Onboarding Template is by default selected - I just have to verify some distinguishing elements
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onboardingTemplate)
         .wait(1000)
         .and('have.css', 'border-color', 'rgb(24, 121, 216)')  //there is a blue border-color of blue which signifies that it is now selected
         .then(()=>{
           //verify the dot has now the color of blue that signify also as selected
           cy.get('form > div > div:nth-child(1) > div:nth-child(1) > div > div')
             .should('exist')
             .and('be.visible')
             .and('have.css', 'background-color', 'rgb(24, 121, 216)') // the color of the dot now is blue
           //verify the title is Onboarding
           cy.get('form > div > div:nth-child(1) > div:nth-child(1) > p')
             .should('exist')
             .and('be.visible')
             .and('have.text', 'Onboarding')
           //verify that the entire template has also a background image
           cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onboardingTemplate)
             .find('img')
               .should('exist')
               .and('be.visible')
               .should('attr', 'src')
               .should('include', '/assets/tasks-templates/onboarding.png')
         })
 
       //Click the Next button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
         .wait(2000)
 
       ///////// CREATE ONBOARDING TASK MANAGEMENT STARTS HERE ///////////////
       //verify modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Enter a Template Name
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
         .find('> input')
         .type('Existing Onboarding '+utilfunc.getFormattedDate())
         .wait(2000)
         .should('have.value', 'Existing Onboarding '+utilfunc.getFormattedDate())
 
       //Now select Partner Type - Existing
       cy.get('form > div > div:nth-child(2) > div > select').select('existing').should('have.value','existing')
         .wait(1000)
 
       //Now select Service Category
       cy.get('form > div > div:nth-child(3) > select').select('Listing Content Creation').should('have.value','Listing Content Creation')
         .wait(1000)
 
       //Now Click the Create button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
         .wait(2000)
 
       ///////// CREATE ONE TIME TASK MANAGEMENT ENDS HERE ///////////////
       //verify alert-success message popup
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
         .should('exist')
         .and('be.visible')
         .then(()=>{
           //verify the message inside
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
             .should('exist')
             .and('be.visible')
             .and('have.text', 'Template has been created.')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
             .and('have.css', 'font-weight', '400')  //font bold
           //verify check mark logo
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
             .should('exist')
             .and('be.visible')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
         })
             
       // I will close the Termination Request modal by pressing the esc key
       cy.get('body').type('{esc}'); // pressing esc button of the keyboard
       cy.wait(2000)
 
       //Going to Task Management > Existing > Onboarding Tab
       //verify Existing Tab
        cy.get(adminmodule.TaskManagementFolder[0].ExistingTab)
          .should('exist')
          .and('be.visible')
          .and('not.be.disabled')
          .and('have.text', 'Existing')

       //I now click the Existing Tab
       cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // after i click
         .and('have.css', 'font-weight', '700')  // font bold

       //verify url destination expectation
       cy.url().should('contain', 'existing&type')
       
       //Verify Onboarding Tab
       cy.get(adminmodule.TaskManagementFolder[0].OnboardingTab)
         .should('exist')
         .and('be.visible')
         .and('not.be.disabled')
         .and('have.text', 'Onboarding')
         .and('have.css', 'color', 'rgb(24, 121, 216)') // default color before i click
         .then((txt)=>{
           const computedStyle = getComputedStyle(txt[0])
           const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
           expect(customPropertyValue).to.equal('1');
         })
           
       //Then I will click the Onboarding Tab then verify it should changed the text color
       cy.click_link_button(adminmodule.TaskManagementFolder[0].OnboardingTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // changed color after i click
         .and('have.css', 'font-weight', '600')  // font bold
           
       //verify url destination expectation
       cy.url().should('contain', 'existing&type=onboarding')
 
       //////// ONBOARDING TABLE ASSERTIONS STARTS HERE ////////
       //verify that the table has expected columns Names
       const ExpectedColumnNames = [
         'Template Name',
         'Partner Type',
         'Service Type',
         'Last Updated',
         'Updated By',
         'Action'
       ];
       cy.get('table > thead > tr > th').each(($option, index)=>{
         cy.wrap($option).should('have.text', ExpectedColumnNames[index]) //verify names based on the expected options
           .should('exist')
           .and('be.visible')
           .then((txt)=>{
             const computedStyle = getComputedStyle(txt[0])
             const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
             expect(customPropertyValue).to.equal('1');
           })
         cy.log(ExpectedColumnNames[index]); 
       });
 
       // THEN, now I will verify the recently created task management that should appear in the Existing > Onboarding Tab
       cy.get('table > tbody > tr:first-child').within(()=>{
         //assert column1 > Template Name
         TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', 'Existing Onboarding '+utilfunc.getFormattedDate())
         //assert column2 > Partner Type
         TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'existing')
         //assert column3 > Service Type
         TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
         //assert column4 > Last Updated
         TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
         //assert column5 > Updated By
         TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
         //assert column6 > Action:Edit
         TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
       })
       //////// ONBOARDING TABLE ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CATM0005 - Create Task Management Recurring Template for Existing client",()=>{


       //calling utility functions
       const utilfunc = new utilityfunctions();

       //calling AdminTaskManagementTablelist
       const TaskTablelist = new TaskManagementTablelist();
 
       //login using admin role
       cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
       //click the Admin nav module
       cy.click_link_button(clientmodulesnavlink.adminnavlink)
         .wait(2000)
 
       //now I am going to click the Task Management folder link
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(1000)
       
       //I will click the add button and expect a Task List Creation - Select a Template to start with modal popup
       cy.click_link_button(adminmodule.TaskManagementFolder[0].Addbutton)
         .wait(2000)
 
       //verify the Task List Creation - Select a Template to start with modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Select Recurring Template
      cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].recurringTemplate)
        .wait(1000)
        .and('have.css', 'border-color', 'rgb(24, 121, 216)')  //After I click the Recurring Template, there is a blue border-color of blue which signifies that it is now selected
        .then(()=>{
          //verify the dot has now the color of blue that signify also as selected
          cy.get('form > div > div:nth-child(1) > div:nth-child(3) > div > div')
            .should('exist')
            .and('be.visible')
            .and('have.css', 'background-color', 'rgb(24, 121, 216)') // the color of the dot now is blue
          //verify the title is Onboarding
          cy.get('form > div > div:nth-child(1) > div:nth-child(3) > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Recurring')
          //verify that the entire template has also a background image
          cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].recurringTemplate)
            .find('img')
              .should('exist')
              .and('be.visible')
              .should('attr', 'src')
              .should('include', '/assets/tasks-templates/recurring.png')
        })
 
       //Click the Next button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
         .wait(2000)
 
       ///////// CREATE RECURRING TASK MANAGEMENT STARTS HERE ///////////////
       //verify modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Enter a Template Name
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
         .find('> input')
         .type('Existing Recurring '+utilfunc.getFormattedDate())
         .wait(2000)
         .should('have.value', 'Existing Recurring '+utilfunc.getFormattedDate())
 
       //Now select Partner Type - Existing
       cy.get('form > div > div:nth-child(2) > div > select').select('existing').should('have.value','existing')
         .wait(1000)
 
       //Now select Service Category
       cy.get('form > div > div:nth-child(3) > select').select('Listing Content Creation').should('have.value','Listing Content Creation')
         .wait(1000)
 
       //Now Click the Create button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
         .wait(2000)
 
       ///////// CREATE RECURRING TASK MANAGEMENT ENDS HERE ///////////////
       //verify alert-success message popup
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
         .should('exist')
         .and('be.visible')
         .then(()=>{
           //verify the message inside
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
             .should('exist')
             .and('be.visible')
             .and('have.text', 'Template has been created.')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
             .and('have.css', 'font-weight', '400')  //font bold
           //verify check mark logo
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
             .should('exist')
             .and('be.visible')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
         })
             
       // I will close the Termination Request modal by pressing the esc key
       cy.get('body').type('{esc}'); // pressing esc button of the keyboard
       cy.wait(2000)
 
       //Going to Task Management > Existing > Recurring Tab
       //I now click the Existing Tab
       cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // after i click
         .and('have.css', 'font-weight', '700')  // font bold

       //verify url destination expectation
       cy.url().should('contain', 'existing&type')
       
       //Then I will click the Recurring Tab then verify it should changed the text color
       cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // changed color after i click
         .and('have.css', 'font-weight', '600')  // font bold
           
       //verify url destination expectation
       cy.url().should('contain', 'existing&type=recurring')
 
       //////// RECURRING TABLE ASSERTIONS STARTS HERE ////////
       //verify that the table has expected columns Names
       const ExpectedColumnNames = [
         'Template Name',
         'Partner Type',
         'Service Type',
         'Last Updated',
         'Updated By',
         'Action'
       ];
       cy.get('table > thead > tr > th').each(($option, index)=>{
         cy.wrap($option).should('have.text', ExpectedColumnNames[index]) //verify names based on the expected options
           .should('exist')
           .and('be.visible')
           .then((txt)=>{
             const computedStyle = getComputedStyle(txt[0])
             const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
             expect(customPropertyValue).to.equal('1');
           })
         cy.log(ExpectedColumnNames[index]); 
       });
 
       // THEN, now I will verify the recently created task management that should appear in the Existing > Recurring Tab
       cy.get('table > tbody > tr:first-child').within(()=>{
         //assert column1 > Template Name
         TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', 'Existing Recurring '+utilfunc.getFormattedDate())
         //assert column2 > Partner Type
         TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'existing')
         //assert column3 > Service Type
         TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
         //assert column4 > Last Updated
         TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
         //assert column5 > Updated By
         TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
         //assert column6 > Action:Edit
         TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
       })
       //////// RECURRING TABLE ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CATM0006 - Create Task Management One Time Template for Existing client",()=>{


       //calling utility functions
       const utilfunc = new utilityfunctions();

       //calling AdminTaskManagementTablelist
       const TaskTablelist = new TaskManagementTablelist();
 
       //login using admin role
       cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
       //click the Admin nav module
       cy.click_link_button(clientmodulesnavlink.adminnavlink)
         .wait(2000)
 
       //now I am going to click the Task Management folder link
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(1000)
       
       //I will click the add button and expect a Task List Creation - Select a Template to start with modal popup
       cy.click_link_button(adminmodule.TaskManagementFolder[0].Addbutton)
         .wait(2000)
 
       //verify the Task List Creation - Select a Template to start with modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Select One Time Template
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onetimeTemplate)
         .wait(1000)
         .and('have.css', 'border-color', 'rgb(24, 121, 216)')  //After I click the Recurring Template, there is a blue border-color of blue which signifies that it is now selected
         .then(()=>{
           //verify the dot has now the color of blue that signify also as selected
           cy.get('form > div > div:nth-child(1) > div:nth-child(4) > div > div')
             .should('exist')
             .and('be.visible')
             .and('have.css', 'background-color', 'rgb(24, 121, 216)') // the color of the dot now is blue
           //verify the title is Onboarding
           cy.get('form > div > div:nth-child(1) > div:nth-child(4) > p')
             .should('exist')
             .and('be.visible')
             .and('have.text', 'One Time')
           //verify that the entire template has also a background image
           cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].onetimeTemplate)
             .find('img')
               .should('exist')
               .and('be.visible')
               .should('attr', 'src')
               .should('include', '/assets/tasks-templates/one-time.png')
         })
 
       //Click the Next button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].nextbutton)
         .wait(2000)
 
       ///////// CREATE ONE TIME TASK MANAGEMENT STARTS HERE ///////////////
       //verify modal popup
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].modal)
         .should('exist')
         .and('be.visible')
 
       //Enter a Template Name
       cy.get(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].TemplateNameInputFieldandLabel)
         .find('> input')
         .type('Existing One Time '+utilfunc.getFormattedDate())
         .wait(2000)
         .should('have.value', 'Existing One Time '+utilfunc.getFormattedDate())
 
       //Now select Partner Type - Existing
       cy.get('form > div > div:nth-child(2) > div > select').select('existing').should('have.value','existing')
         .wait(1000)
 
       //Now select Service Category
       cy.get('form > div > div:nth-child(3) > select').select('Listing Content Creation').should('have.value','Listing Content Creation')
         .wait(1000)
 
       //Now Click the Create button
       cy.click_link_button(adminmodule.TaskManagementFolder[0].SelectaTemplatetoStartWithModal[0].createbutton)
         .wait(2000)
 
       ///////// CREATE ONE TIME TASK MANAGEMENT ENDS HERE ///////////////
       //verify alert-success message popup
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
         .should('exist')
         .and('be.visible')
         .then(()=>{
           //verify the message inside
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
             .should('exist')
             .and('be.visible')
             .and('have.text', 'Template has been created.')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
             .and('have.css', 'font-weight', '400')  //font bold
           //verify check mark logo
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
             .should('exist')
             .and('be.visible')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
         })
             
       // I will close the Termination Request modal by pressing the esc key
       cy.get('body').type('{esc}'); // pressing esc button of the keyboard
       cy.wait(2000)
 
       //Going to Task Management > Existing > One Time Tab
       //I now click the Existing Tab
       cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // after i click
         .and('have.css', 'font-weight', '700')  // font bold

       //verify url destination expectation
       cy.url().should('contain', 'existing&type')
       
       //Then I will click the One Time Tab then verify it should changed the text color
       cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
         .wait(2000)
         .should('have.css', 'color', 'rgb(24, 121, 216)') // changed color after i click
         .and('have.css', 'font-weight', '600')  // font bold
           
       //verify url destination expectation
       cy.url().should('contain', 'existing&type=one-time')
 
       //////// ONE TIME TABLE ASSERTIONS STARTS HERE ////////
       //verify that the table has expected columns Names
       const ExpectedColumnNames = [
         'Template Name',
         'Partner Type',
         'Service Type',
         'Last Updated',
         'Updated By',
         'Action'
       ];
       cy.get('table > thead > tr > th').each(($option, index)=>{
         cy.wrap($option).should('have.text', ExpectedColumnNames[index]) //verify names based on the expected options
           .should('exist')
           .and('be.visible')
           .then((txt)=>{
             const computedStyle = getComputedStyle(txt[0])
             const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
             expect(customPropertyValue).to.equal('1');
           })
         cy.log(ExpectedColumnNames[index]); 
       });
 
       // THEN, now I will verify the recently created task management that should appear in the Existing > One Time Tab
       cy.get('table > tbody > tr:first-child').within(()=>{
         //assert column1 > Template Name
         TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', 'Existing One Time '+utilfunc.getFormattedDate())
         //assert column2 > Partner Type
         TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'existing')
         //assert column3 > Service Type
         TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
         //assert column4 > Last Updated
         TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
         //assert column5 > Updated By
         TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
         //assert column6 > Action:Edit
         TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
       })
       //////// ONE TIME TABLE ASSERTIONS ENDS HERE ////////
    })
    it("Testcase ID: CATM0007 - Edit Name of the Existing New Onboarding Task Management",()=>{

      let GETpageurl;
      let taskpageurl;
      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)
      
      //Now I will select row 1 of the existing task at the New > Onboarding tab
      //prior to opening its task page, I will get the url
      GETpageurl = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .invoke('attr', 'href')
          .then((href)=>{
            taskpageurl = href;
            resolve();
          })
      })
      //also get the task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })
        
      //click the Action:Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a').click().wait(3000)
        
      //verify url destination expectation
      cy.get('body').then(()=>{
        GETpageurl.then(()=>{
          cy.url().should('contain', taskpageurl)
        })
      }) 
      
      //verify The Name of the opened task as its title page
      cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          GETtaskName.then(()=>{
            cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
              .should('have.text', taskName)
              .and('have.css', 'font-weight', '700') // font bold
          })
        })

      //verify Update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Update')
        .and('have.css', 'color', 'rgb(250, 250, 250)') // text color
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') // the color that shape like a capsule
        .and('have.css', 'border-radius', '9999px') //the curve edge of the background color

      //verify Settings elements
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .should('exist')
        .and('be.visible')
        .within(()=>{
          //assert the span where the Settings title resides
          cy.get('span')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Settings')
            .and('have.css', 'font-weight', '700')  // font bold
          //assert the svg '>' button that appears in the web page somewhere below the Update button
          cy.get('svg')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled') 
        })

      //verify Tasks title h4
      cy.get(adminmodule.TaskManagementFolder[1].tasktitleh4)
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Tasks')
        .and('have.css', 'font-weight', '700')  // font bold

      //verify Add task button
      cy.get(adminmodule.TaskManagementFolder[1].AddTaskButton)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled')
        .and('have.text', 'Add')
        .and('have.css', 'font-weight', '700')  // font bold
        .and('have.css', 'color', 'rgb(0, 47, 93)') // text color
        .and('have.css', 'border-color', 'rgb(0, 47, 93)') //the outline of the background that shape like a capsule
        .and('have.css', 'border-radius', '40px') // the curve edge

      //verify Onboarding task elements auto created
      cy.get('div.space-y-8 > div.space-y-8 > div > div')
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'aria-expanded', 'false') // it means the svg button is not click and when it does, there will reveal another elements under it
        .within(()=>{
          //assert the svg button
          cy.get(' div > div > svg')
            .should('exist')
            .and('be.visible')
            .and('not.be.disabled')
          //assert the title Onboarding tasks
          cy.get(' div > p')
            .should('exist')
            .and('be.visible')
            .and('have.text', 'Onboarding tasks')
            .and('have.css', 'font-weight', '700')  // font bold
        })

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      //a group of settings element will reveal below under the settings
      cy.get('form > div:nth-child(3) > div:nth-child(2)')
        .should('exist')
        .and('be.visible')
        .within(()=>{
          //assert Template name and its label
          cy.get(' > div > div:nth-child(1)')
            .should('exist')
            .and('be.visible')
            .within(()=>{
              //assert Template Name* label
              cy.get('label')
                .should('exist')
                .and('be.visible')
                .and('have.text', 'Template Name*')
                .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)')  // asterisk color > red
              //assert input field
              cy.get('input')
                .should('exist')
                .and('be.visible')
                .invoke('attr', 'value')
                .then((value)=>{
                  cy.log('dasdasas'+value)
                  GETtaskName.then(()=>{
                    expect(value).to.equal(taskName);
                  })
                });
            }); // END TEMPLATE NAME WITHIN
          //assert Template Type label and its drop down list
          cy.get(' > div > div:nth-child(2)')
            .should('exist')
            .and('be.visible')
            .within(()=>{
              //assert Template Type* label
              cy.get('label')
                .should('exist')
                .and('be.visible')
                .and('have.text', 'Template Type*')
                .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)')  // asterisk color > red
              //assert Template Type drop down menu
              cy.get('select')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .within(()=>{
                  const TemplateTypeOptions = [
                    'Choose One',
                    'Onboarding',
                    'Roadmap',
                    'Recurring',
                    'One Time'
                  ];
                  cy.get('option').each(($option, index) => {
                    cy.wrap($option).should('have.text', TemplateTypeOptions[index]) //verify names based on the expected options
                    .should('exist')
                    cy.log(TemplateTypeOptions[index]) 
                  });
                });
            }); // END TEMPLATE TYPE WITHIN
          //assert Partner Type label and its drop down list
          cy.get(' > div > div:nth-child(3)')
            .should('exist')
            .and('be.visible')
            .within(()=>{
              //assert Partner Type* label
              cy.get('label')
                .should('exist')
                .and('be.visible')
                .and('have.text', 'Partner Type *')
                .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)')  // asterisk color > red
              //assert Partner Type drop down menu
              cy.get('div > select')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .within(()=>{
                  const PartnerTypeOptions = [
                    'Choose One',
                    'New',
                    'Existing'
                  ];
                  cy.get('option').each(($option, index) => {
                    cy.wrap($option).should('have.text', PartnerTypeOptions[index]) //verify names based on the expected options
                    .should('exist')
                    cy.log(PartnerTypeOptions[index]) 
                  });
                });
            }); // END PARTNER TYPE WITHIN
          //assert Service Category label and its drop down list
          cy.get(' > div > div:nth-child(4)')
            .should('exist')
            .and('be.visible')
            .within(()=>{
              //assert Service Category* label
              cy.get('label')
                .should('exist')
                .and('be.visible')
                .and('have.text', 'Service Category*')
                .find('sup').should('have.css', 'color', 'rgb(237, 46, 46)')  // asterisk color > red
              //assert Service Category drop down menu
              cy.get('select')
                .should('exist')
                .and('be.visible')
                .and('not.be.disabled')
                .within(()=>{
                  const ServiceCategoryOptions = [
                    'Choose One',
                    'Full Account Management',
                    'PPC Management',
                    'Listing Content Creation',
                    'Account Health Management',
                    'Account Health Issue',
                    'Seller Launch',
                    'Account Creation',
                    'Amazon Traffic Boost',
                    'Advertising Management',
                    'Google Advertising',
                    'Meta Advertising',
                    'SEO Management',
                    'Website Content',
                    'Mailchimp Management',
                    'Website Activation'
                  ];
                  cy.get('option').each(($option, index)=>{
                    cy.wrap($option).should('have.text', ServiceCategoryOptions[index]) //verify names based on the expected options
                      .should('exist')
                      .and('not.be.disabled')
                      cy.log(ServiceCategoryOptions[index]) 
                  })
                })
            }) // END SERVICE CATEGORY WITHIN
        }) // END MAIN WITHIN

      //now if I am going to click again the svg '>' button in settings, all the settings group of elements below will hide or not visible in the dom
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      //now it should not be visible
      cy.get('form > div:nth-child(3) > div:nth-child(2)')
        .should('not.exist')

      //now I am going to click the Onboarding Task and as expected that a certain elements would reveal
      cy.get('div.space-y-8 > div.space-y-8 > div > div')
        .click()
        .wait(2000)
        .should('have.attr', 'aria-expanded', 'true') // after it was click

      //verify additional sub elements reveal
      // Task Description label
      cy.get('div.space-y-8 > div.space-y-8 > div > div > p:nth-child(2)')
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Description')

      //verify Actons label
      cy.get('div.space-y-8 > div.space-y-8 > div > div > p:nth-child(3)')
        .should('exist')
        .and('be.visible')
        .and('have.text', 'Actions')

      //verify No Items - default description label
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
        .should('exist')
        .and('be.visible')
        .find('p').should('exist').should('have.text', 'No Items')

      //now as I click again the Onboarding task, it should be hidden the Desciptions, Actions, and No Items elements
      cy.get('div.space-y-8 > div.space-y-8 > div > div > div > div > svg').click().wait(1000)
      cy.get('div.space-y-8 > div.space-y-8 > div > div')
        .should('have.attr', 'aria-expanded', 'false') // after it was click

      // Task Description label
      cy.get('div.space-y-8 > div.space-y-8 > div > div > p:nth-child(2)')
        .should('not.exist')

      //Actions label
      cy.get('div.space-y-8 > div.space-y-8 > div > div > p:nth-child(3)')
        .should('not.exist')

      //verify No Items - default description label
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
        .should('not.exist')

      ///// EDIT NAME STARTS HERE ////////
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // Edit The Name
      cy.get('form > div:nth-child(3) > div:nth-child(2)')
        .find('input').clear().type('Editted today '+utilfunc.getFormattedDate())
        .should('have.value', 'Editted today '+utilfunc.getFormattedDate())

      //click the Update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
           
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
      ///// EDIT NAME ENDS HERE ////////

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      /// At the New > Onboarding Tab > row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a ')
        .should('have.text', 'Editted today '+utilfunc.getFormattedDate())
    })
    it("Testcase ID: CATM0008 - Change Service Category of the Existing New Onboarding Task Management",()=>{


      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // I will select again the same task which I editted previously in Testcase ID: CATM0007
      // I will click the edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // Under Service Category I will get all the options in the select drop down menu
      // Get all options and their values excluding the first one
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select > option:not(:first-child)').then($options => {
        const optionValues = Array.from($options)
          .slice(1)
          .map(option => option.value);

        // Iterate through each option value with a delay
        optionValues.forEach((optionValue, index) => {
          // Select an option by its value using the specific CSS selector
          cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select')
            .select(optionValue)
            .should('have.value', optionValue); // Assertion for selected option value

          // Add a 2-second delay after each selection except for the last one
          if (index < optionValues.length - 1) {
            cy.wait(1000); // Wait for 1 second
          }
        });
      });

      // Then here i will only going to select one and save it
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select')
        .select('Account Creation')
        .wait(1000)
        .should('have.value', 'Account Creation');

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      /// Then verify on the same task under Service Type column that the changes applied
      cy.get('table > tbody > tr:first-child > td:nth-child(3)')
        .should('have.text', 'Account Creation')
    })
    it("Testcase ID: CATM0009 - Change Template Type of the Existing New Onboarding Task Management from Onboarding > Recurring > One Time then back to Onboarding",()=>{

      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();
      
      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //I will get the current task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })

      // I will select again the same task which I editted previously in Testcase ID: CATM0007
      // I will click the edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Onboarding to Recurring
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('recurring')
        .wait(1000)
        .should('have.value', 'recurring')
      
      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)
      
      //Verify in the Recurring Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      
      // Then I will open its page and change the template from Recurring to One Time
      //Click its Edit button 
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(3000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // Select One Time under the Template Type
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('One Time')
        .wait(1000)
        .should('have.value', 'one-time')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
         .wait(3000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the One Time Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      
      //Click its Edit button 
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(3000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      //Finally, I will change the Template Type again from One Time to Onboarding
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('Onboarding')
        .wait(1000)
        .should('have.value', 'onboarding')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the Onboarding Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      
    })
    it("Testcase ID: CATM00010 - Change Partner Type of the Existing New Onboarding Task Management from New >Existing > then back to New",()=>{


      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();
      
      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();


       //login using admin role
       cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

       //click the Admin nav module
       cy.click_link_button(clientmodulesnavlink.adminnavlink)
         .wait(2000)
 
       //now I am going to click the Task Management folder link
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(3000)
      
      //I will get the current task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })

       // I will select again the same task which I editted previously in Testcase ID: CATM0007
       // I will click the edit button
       cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
         .click()
         .wait(2000)
         
       //now I will click the svg '>' button in the settings to reveal
       cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
         .find('svg').click().wait(2000)

      // At Partner Type, Select 'Existing'
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div > select')
        .select('existing')
        .wait(1000)
        .should('have.value', 'existing')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)
      
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // Click the Existing Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
         .wait(2000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //// EXISTING > ONBOARDING TAB ASSERTIONS STARTS HERE //////
      
      cy.get('table > tbody > tr:nth-child(2)').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'existing')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })

      //// EXISTING > ONBOARDING TAB ASSERTIONS ENDS HERE //////

      //Then I will click the Edit button
      cy.get('table > tbody > tr:nth-child(2) > td:nth-child(6) > a')
        .click()
        .wait(2000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
      .find('svg').click().wait(2000)

      // At Partner Type, Select 'Existing'
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div > select')
        .select('new')
        .wait(1000)
        .should('have.value', 'new')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)
      
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //// NEW > ONBOARDING TAB ASSERTIONS STARTS HERE //////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      //// NEW > ONBOARDING TAB ASSERTIONS ENDS HERE //////
    })
    it("Testcase ID: CATM00011 - Edit Name of the Existing New Recurring Task Management",()=>{


      let GETpageurl;
      let taskpageurl;
      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //Now I will select row 1 of the existing task at the New > Onboarding tab
      //prior to opening its task page, I will get the url
      GETpageurl = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .invoke('attr', 'href')
          .then((href)=>{
            taskpageurl = href;
            resolve();
          })
      })
      //also get the task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })
        
      //click the Action:Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a').click().wait(3000)
        
      //verify url destination expectation
      cy.get('body').then(()=>{
        GETpageurl.then(()=>{
          cy.url().should('contain', taskpageurl)
        })
      }) 
      
      //verify The Name of the opened task as its title page
      cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          GETtaskName.then(()=>{
            cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
              .should('have.text', taskName)
              .and('have.css', 'font-weight', '700') // font bold
          })
        })

      //verify The Name of the opened task as its title page
      cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          GETtaskName.then(()=>{
            cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
              .should('have.text', taskName)
              .and('have.css', 'font-weight', '700') // font bold
          })
        })

      ///// EDIT NAME STARTS HERE ////////
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // Edit The Name
      cy.get('form > div:nth-child(3) > div:nth-child(2)')
        .find('input').clear().type('Editted Recurring today '+utilfunc.getFormattedDate())
        .should('have.value', 'Editted Recurring today '+utilfunc.getFormattedDate())

      //click the Update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
           
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
      ///// EDIT NAME ENDS HERE ////////

      //I will click the Task Management link text folder 
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)
      
      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      /// At the New > Recurring Tab > row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a ')
        .should('have.text', 'Editted Recurring today '+utilfunc.getFormattedDate())
    })
    it("Testcase ID: CATM00012 - Change Service Category of the Existing New Recurring Task Management",()=>{


      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // Under Service Category I will get all the options in the select drop down menu
      // Get all options and their values excluding the first one
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select > option:not(:first-child)').then($options => {
        const optionValues = Array.from($options)
          .slice(1)
          .map(option => option.value);

        // Iterate through each option value with a delay
        optionValues.forEach((optionValue, index) => {
          // Select an option by its value using the specific CSS selector
          cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select')
            .select(optionValue)
            .should('have.value', optionValue); // Assertion for selected option value

          // Add a 2-second delay after each selection except for the last one
          if (index < optionValues.length - 1) {
            cy.wait(1000); // Wait for 1 second
          }
        });
      });

      // Then here i will only going to select one and save it
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select')
        .select('Account Creation')
        .wait(1000)
        .should('have.value', 'Account Creation');

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      /// Then verify on the same task under Service Type column that the changes applied
      cy.get('table > tbody > tr:first-child > td:nth-child(3)')
        .should('have.text', 'Account Creation')
    })
    it("Testcase ID: CATM00013 - Change Template Type of the Existing New Recurring Task Management from Recurring > One Time > Onboarding then back to Recurring",()=>{

      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //I will get the current task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Recurring > One Time
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('one-time')
        .wait(1000)
        .should('have.value', 'one-time')
      
      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
         .wait(3000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the One Time Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      
      //Click its Edit button 
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(3000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      //Then, I will change the Template Type again from One Time to Onboarding
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('Onboarding')
        .wait(1000)
        .should('have.value', 'onboarding')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the Onboarding Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Onboarding > Recurring
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('recurring')
        .wait(1000)
        .should('have.value', 'recurring')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

        // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the Recurring Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
    })
    it("Testcase ID: CATM00014 - Change Partner Type of the Existing New Recurring Task Management from New >Existing > then back to New",()=>{

      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //I will get the current task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

       // At Partner Type, Select 'Existing'
       cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div > select')
       .select('existing')
       .wait(1000)
       .should('have.value', 'existing')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)
     
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // Click the Existing Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
          .wait(2000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //// EXISTING > RECURRING TAB ASSERTIONS STARTS HERE //////
      
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'existing')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })

      //// EXISTING > RECURRING TAB ASSERTIONS ENDS HERE //////

      //Then I will click the Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
      .find('svg').click().wait(2000)

      // At Partner Type, Select 'Existing'
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div > select')
        .select('new')
        .wait(1000)
        .should('have.value', 'new')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)
      
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //// NEW > RECURRING TAB ASSERTIONS STARTS HERE //////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      //// NEW > RECURRING TAB ASSERTIONS ENDS HERE //////
    })
    it("Testcase ID: CATM00015 - Edit Name of the Existing New One Time Task Management",()=>{

      let GETpageurl;
      let taskpageurl;
      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)

      //prior to opening its task page, I will get the url
      GETpageurl = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .invoke('attr', 'href')
          .then((href)=>{
            taskpageurl = href;
            resolve();
          })
      })

      //also get the task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })
        
      //click the Action:Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a').click().wait(3000)
        
      //verify url destination expectation
      cy.get('body').then(()=>{
        GETpageurl.then(()=>{
          cy.url().should('contain', taskpageurl)
        })
      }) 
      
      //verify The Name of the opened task as its title page
      cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          GETtaskName.then(()=>{
            cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
              .should('have.text', taskName)
              .and('have.css', 'font-weight', '700') // font bold
          })
        })

      //verify The Name of the opened task as its title page
      cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          GETtaskName.then(()=>{
            cy.get(adminmodule.TaskManagementFolder[1].tasknametitle)
              .should('have.text', taskName)
              .and('have.css', 'font-weight', '700') // font bold
          })
        })

      ///// EDIT NAME STARTS HERE ////////
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // Edit The Name
      cy.get('form > div:nth-child(3) > div:nth-child(2)')
        .find('input').clear().type('Editted One Time today '+utilfunc.getFormattedDate())
        .should('have.value', 'Editted One Time today '+utilfunc.getFormattedDate())

      //click the Update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
           
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
      ///// EDIT NAME ENDS HERE ////////

      //I will click the Task Management link text folder 
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)
      
      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)

      /// At the New > Recurring Tab > row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(1) > a ')
        .should('have.text', 'Editted One Time today '+utilfunc.getFormattedDate())
    })
    it("Testcase ID: CATM00016 - Change Service Category of the Existing New One Time Task Management",()=>{

       //calling utility functions
       const utilfunc = new utilityfunctions();

       //calling AdminTaskManagementTablelist
       const TaskTablelist = new TaskManagementTablelist();
 
       //login using admin role
       cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
 
       //click the Admin nav module
       cy.click_link_button(clientmodulesnavlink.adminnavlink)
         .wait(2000)
 
       //now I am going to click the Task Management folder link
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(3000)
 
       //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)
 
       // I will click the edit button of the task in row 1
       cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
         .click()
         .wait(2000)
         
       //now I will click the svg '>' button in the settings to reveal
       cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
         .find('svg').click().wait(2000)
 
       // Under Service Category I will get all the options in the select drop down menu
       // Get all options and their values excluding the first one
       cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select > option:not(:first-child)').then($options => {
         const optionValues = Array.from($options)
           .slice(1)
           .map(option => option.value);
 
         // Iterate through each option value with a delay
         optionValues.forEach((optionValue, index) => {
           // Select an option by its value using the specific CSS selector
           cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select')
             .select(optionValue)
             .should('have.value', optionValue); // Assertion for selected option value
 
           // Add a 2-second delay after each selection except for the last one
           if (index < optionValues.length - 1) {
             cy.wait(1000); // Wait for 1 second
           }
         });
       });
 
       // Then here i will only going to select one and save it
       cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(4) > select')
         .select('Account Creation')
         .wait(1000)
         .should('have.value', 'Account Creation');
 
       //click the update button
       cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
         .click()
         .wait(2000)
 
       //verify alert-success message popup
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
         .should('exist')
         .and('be.visible')
         .then(()=>{
           //verify the message inside
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
             .should('exist')
             .and('be.visible')
             .and('have.text', 'The task list template has been successfully updated.')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
             .and('have.css', 'font-weight', '400')  //font bold
           //verify check mark logo
           cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
             .should('exist')
             .and('be.visible')
             .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
         })
 
       // I will close the Termination Request modal by pressing the esc key
       cy.get('body').type('{esc}'); // pressing esc button of the keyboard
       cy.wait(2000)
 
       //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
       cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
         .wait(3000)
 
       //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)
 
       /// Then verify on the same task under Service Type column that the changes applied
       cy.get('table > tbody > tr:first-child > td:nth-child(3)')
         .should('have.text', 'Account Creation')
    })
    it("Testcase ID: CATM00017 - Change Template Type of the Existing New One Time Task Management from One Time > Recurring > Onboarding then back to One Time",()=>{


      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)

      //I will get the current task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Recurring > One Time
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('recurring')
        .wait(1000)
        .should('have.value', 'recurring')
      
      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(3000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the Recurring Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      
      //Click its Edit button 
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(3000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      //Then, I will change the Template Type again from One Time to Onboarding
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('Onboarding')
        .wait(1000)
        .should('have.value', 'onboarding')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the Onboarding Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Onboarding > One Time
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('one-time')
        .wait(1000)
        .should('have.value', 'one-time')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

        // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)
      
      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //Verify in the One Time Tab table specifically in Row 2 which the newly transferred resides
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
    })
    it("Testcase ID: CATM00018 - Change Partner Type of the Existing New One Time Task Management from New >Existing > then back to New",()=>{

      let GETtaskName;
      let taskName;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //calling AdminTaskManagementTablelist
      const TaskTablelist = new TaskManagementTablelist();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)

      //I will get the current task name
      GETtaskName = new Promise((resolve)=>{
        cy.get('table > tbody > tr:first-child > td:nth-child(1) > a')
          .then((txt)=>{
            taskName = txt.text().trim();
            resolve();
          })
      })

      // I will click the edit button of the task in row 1
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
        
      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

       // At Partner Type, Select 'Existing'
       cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div > select')
       .select('existing')
       .wait(1000)
       .should('have.value', 'existing')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)
     
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // Click the Existing Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
          .wait(2000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //// EXISTING > ONE TIME TAB ASSERTIONS STARTS HERE //////
      
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'existing')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })

      //// EXISTING > ONE TIME TAB ASSERTIONS ENDS HERE //////

      //Then I will click the Edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
      .find('svg').click().wait(2000)

      // At Partner Type, Select 'Existing'
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div > select')
        .select('new')
        .wait(1000)
        .should('have.value', 'new')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)
      
      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will the Task Management link text folder to verify back in the New > Onboarding tab that the changes also reflected
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the One Time Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].OneTimeTab)
        .wait(2000)

      //I will click the column name 'Last Updated' so that the recently editted task will go on top row 1
      cy.get('table > thead > tr > th:nth-child(4)').click().wait(3000)

      //// NEW > ONE TIME TAB ASSERTIONS STARTS HERE //////
      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column1 > Template Name
        cy.get(' > td:nth-child(1) > a').then(()=>{
          GETtaskName.then(()=>{
            TaskTablelist.verifycolumn1TemplateName(' > td:nth-child(1) > a', taskName)
          })
        })
        //assert column2 > Partner Type
        TaskTablelist.verifycolumn2PartnerType(' > td:nth-child(2)', 'new')
        //assert column3 > Service Type
        //TaskTablelist.verifycolumn3ServiceType(' > td:nth-child(3)', 'Listing Content Creation')
        //assert column4 > Last Updated
        TaskTablelist.verifycolumn4LastUpdated(' > td:nth-child(4)', utilfunc.getFormattedDateMonthDayYearVersion2())
        //assert column5 > Updated By
        TaskTablelist.verifycolumn5UpdatedBy(' > td:nth-child(5)', 'BA', 'BS Admin')
        //assert column6 > Action:Edit
        TaskTablelist.verifycolumn6ActionEdit(' > td:nth-child(6) > a', 'not.be.disabled', 'Edit')
      })
      //// NEW > ONE TIME TAB ASSERTIONS ENDS HERE //////
    })
    it("Testcase ID: CATM00019 - Convert New Onboarding to New Recurring Task Management and verify that there are SI-Operations, SI-PPC, SI-Writing, SI-Design, SI-Admin, Billing, Sales, Lead Generation will replace the Onboarding Task",()=>{


      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // I will click the edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Onboarding to Recurring
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('recurring')
        .wait(1000)
        .should('have.value', 'recurring')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      // I will verify that there are 8 Tasks automatically created and are as follows:
      //SI-Operations, SI-PPC, SI-Writing, SI-Design, SI-Admin, Billing, Sales, Lead Generation will replace the Onboarding Task

      //verify the expected total count is 8 tasks at the time of this testing
      cy.get('div.mt-8 > div:nth-child(2)')
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //this is where i count all the tasks automatically created when it was converted into Recurring
          cy.get('div.mt-8 > div:nth-child(2) > div')
            .its('length')
            .then((divCount)=>{
              cy.log(`Total Count is -> ${divCount}`)
              expect(divCount).to.equal(8);

              //this is where i verified each tasks group of elements
              //loop each div tasks and verify their inner elements existence
              for(let i = 1; i <= divCount; i++){
                cy.get('div.mt-8 > div:nth-child(2) > div:nth-child('+i+') > div > div')
                  .within(()=>{
                    //the svg '>' button before the task name
                    cy.get('div')
                      .should('exist')
                      .and('be.visible')
                      .find('svg').should('exist').and('be.visible').and('not.be.disabled');
                    // the name of th task
                    const expectedtaskNames = "SI-Operations SI-PPC SI-Writing SI-Design SI-Admin Billing Sales Lead Generation";
                    cy.get('p')
                      .should('exist')
                      .and('be.visible')
                      .and('have.css', 'font-weight', '700')  // font bold
                      .then((txt)=>{
                        expect(expectedtaskNames).to.contain(txt.text().trim());
                      })
                  })
              } //END OF FOR LOOP
            })
        })

      // I will now change the Template Type back to Onboarding
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('onboarding')
        .wait(1000)
        .should('have.value', 'onboarding')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('be.visible')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('be.visible')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will verify that there should be only 1 task and that is Onboarding task
      cy.get('div.mt-8 > div:nth-child(2)')
        .should('exist')
        .and('be.visible')
        .then(()=>{
          //the expected count here is 1 which is Onboarding task
          cy.get('div.mt-8 > div:nth-child(2) > div')
            .its('length')
            .then((divCount)=>{
              cy.log(`Total Count is -> ${divCount}`)
              expect(divCount).to.equal(1);
            })
          //assert that it is the Onboarding task with its inner elements
          cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(1) > div > div')
            .should('exist')
            .and('be.visible')
            .within(()=>{
              //the svg '>' button before the task name
              cy.get('div')
                .should('exist')
                .and('be.visible')
                .find('svg').should('exist').and('be.visible').and('not.be.disabled');
              // the name of th task
              cy.get('p')
                .should('exist')
                .and('be.visible')
                .and('have.css', 'font-weight', '700')  // font bold
                .then((txt)=>{
                  expect('Onboarding tasks').to.contain(txt.text().trim());
                })
            })
        })
        /*
      //assert there is SI-Operations group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(1) > div')
        .should('exist')
        .and('be.visible')
      //assert there is SI-PPC group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(2) > div')
        .should('exist')
        .and('be.visible')
      //assert there is SI-Writing group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(3) > div')
        .should('exist')
        .and('be.visible')
      //assert there is SI-Design group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(4) > div')
        .should('exist')
        .and('be.visible')
      //assert there is Admin group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(5) > div')
        .should('exist')
        .and('be.visible')
      //assert there is Billing group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(6) > div')
        .should('exist')
        .and('be.visible')
      //assert there is Sales group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(7) > div')
        .should('exist')
        .and('be.visible')
      //assert there is Lead Generation group of elements
      cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(8) > div')
        .should('exist')
        .and('be.visible')
     */
          
      
    })
    // **** CLIENTS TERMINATION ENDS HERE ***
    it("Testcase ID: CATM00020 - Convert New Onboarding to New One Time Task Management and verify that there are SI-Operations, SI-PPC, SI-Writing, SI-Design, SI-Admin, Billing, Sales, Lead Generation will replace the Onboarding Task",()=>{


      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // I will click the edit button
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)

      //now I will click the svg '>' button in the settings to reveal
      cy.get(adminmodule.TaskManagementFolder[1].pagesettings)
        .find('svg').click().wait(2000)

      // I will now change the Template Type from Onboarding to Recurring
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('one-time')
        .wait(1000)
        .should('have.value', 'one-time')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      // I will verify that there are 8 Tasks automatically created and are as follows:
      //SI-Operations, SI-PPC, SI-Writing, SI-Design, SI-Admin, Billing, Sales, Lead Generation will replace the Onboarding Task

      //verify the expected total count is 8 tasks at the time of this testing
      cy.get('div.mt-8 > div:nth-child(2)')
        .should('exist')
        .then(()=>{
          //this is where i count all the tasks automatically created when it was converted into Recurring
          cy.get('div.mt-8 > div:nth-child(2) > div')
            .its('length')
            .then((divCount)=>{
              cy.log(`Total Count is -> ${divCount}`)
              expect(divCount).to.equal(8);

              //this is where i verified each tasks group of elements
              //loop each div tasks and verify their inner elements existence
              for(let i = 1; i <= divCount; i++){
                cy.get('div.mt-8 > div:nth-child(2) > div:nth-child('+i+') > div > div')
                  .within(()=>{
                    //the svg '>' button before the task name
                    cy.get('div')
                      .should('exist')
                      .find('svg').should('exist').and('be.visible').and('not.be.disabled');
                    // the name of th task
                    const expectedtaskNames = "SI-Operations SI-PPC SI-Writing SI-Design SI-Admin Billing Sales Lead Generation";
                    cy.get('p')
                      .should('exist')
                      .and('have.css', 'font-weight', '700')  // font bold
                      .then((txt)=>{
                        expect(expectedtaskNames).to.contain(txt.text().trim());
                      })
                  })
              } //END OF FOR LOOP
            })
        })

      // I will now change the Template Type back to Onboarding
      cy.get('form > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(2) > select')
        .select('onboarding')
        .wait(1000)
        .should('have.value', 'onboarding')

      //click the update button
      cy.get(adminmodule.TaskManagementFolder[1].UpdateButton)
        .click()
        .wait(2000)

      //verify alert-success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'The task list template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //I will verify that there should be only 1 task and that is Onboarding task
      cy.get('div.mt-8 > div:nth-child(2)')
        .should('exist')
        .then(()=>{
          //the expected count here is 1 which is Onboarding task
          cy.get('div.mt-8 > div:nth-child(2) > div')
            .its('length')
            .then((divCount)=>{
              cy.log(`Total Count is -> ${divCount}`)
              expect(divCount).to.equal(1);
            })
          //assert that it is the Onboarding task with its inner elements
          cy.get('div.mt-8 > div:nth-child(2) > div:nth-child(1) > div > div')
            .should('exist')
            .within(()=>{
              //the svg '>' button before the task name
              cy.get('div')
                .should('exist')
                .find('svg').should('exist').and('be.visible').and('not.be.disabled');
              // the name of th task
              cy.get('p')
                .should('exist')
                .and('have.css', 'font-weight', '700')  // font bold
                .then((txt)=>{
                  expect('Onboarding tasks').to.contain(txt.text().trim());
                })
            })
        })
    })
    it("Testcase ID: CATM00021 - Add > Edit > Delete Task to Onboarding Task in Existing New Onboarding Template Task",()=>{

      //calling AddTaskAtTaskManagement
      const taskM = new AddTaskManagements();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      // I will click the edit button of the row 1 task
      cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
        .click()
        .wait(2000)
      
      //Click the Task Add button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].AddTaskButton)
        .wait(2000)

      //verify that there is Enter Task Name elements, Enter Task Description, check and delete buttons showed up after you click the Task Add button
      //basically an entire add task form
      cy.get('div.main-content-inner2 > div > div > form')
        .should('exist')
        .within(()=>{
          //assert Task Name input field
          cy.get('input[name="title"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'placeholder', 'Enter task name')
            .and('have.value', '')  //by default, it is empty
          //assert Task Description input field
          cy.get('input[name="description"]')
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'placeholder', 'Enter task description')
            .and('have.value', '')  //by default, it is empty
          //assert check/submit/save button
          cy.get('button.bg-secondary')
            .should('exist')
            .and('not.be.disabled')
            .and('have.css', 'background-color', 'rgb(0, 47, 93)') // background color that forms a square button
            .and('have.css', 'border-color', 'rgb(0, 47, 93)') //the outline color of the background color
            .and('have.css', 'border-radius', '10px') // the curve edge
            .find('svg').and('have.css', 'color', 'rgb(255, 255, 255)') // check mark color
          //assert delete button
          cy.get('button.bg-white')
            .should('exist')
            .and('not.be.disabled')
            .and('have.css', 'background-color', 'rgb(255, 255, 255)') // background color that forms a square button
            .and('have.css', 'border-color', 'rgb(148, 148, 148)') //the outline color of the background color
            .and('have.css', 'border-radius', '10px') // the curve edge
            .find('svg').and('have.css', 'color', 'rgb(148, 148, 148)') // x mark color
        })
      /*
      //Now if I click the delete button, the entire entry form should not be visible
      cy.get(adminmodule.TaskManagementFolder[1].deletebutton).click().wait(2000)
      
      //Entry form should no longer exist
      cy.get('div.main-content-inner2 > div > div > form')
        .should('not.exist')

      //Click again the Task Add button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].AddTaskButton)
        .wait(2000)

      ///// REQUIRED FIELDS ASSERTIONS STARTS HERE //////////
      //Click the check/submit/save button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].check_submit_save_button)
        .wait(2000)

      //verify Error Text 1 appeared below the Task name input field
      cy.get('.p-4 > .grid > :nth-child(1) > div')
        .should('exist')
        .and('have.text', 'title is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

      //verify Error Text 2 appeared below the Task Description input field
      cy.get('.p-4 > .grid > :nth-child(2) > div')
        .should('exist')
        .and('have.text', 'description is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

      //Now Enter Task Name
      cy.get(adminmodule.TaskManagementFolder[1].taskNameInputfield).type('New Task Added Under Onboarding Task')
        .wait(1000)
        .should('have.value', 'New Task Added Under Onboarding Task')

      //Click check/submit/save button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].check_submit_save_button)
        .wait(2000)

      //Verify Error Text 1 should no longer exist
      cy.get('.p-4 > .grid > :nth-child(1) > div')
        .should('not.exist')

      //verify Error Text 2 still exist below the Task Description input field
      cy.get('.p-4 > .grid > :nth-child(2) > div')
        .should('exist')
        .and('have.text', 'description is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

      //Enter Task Description
      cy.get(adminmodule.TaskManagementFolder[1].taskDescriptionInputfield).type('This description is for the recently added task under the Onboarding task')
        .wait(1000)
        .should('have.value', 'This description is for the recently added task under the Onboarding task')

      //Verify Error Text 1 should no longer exist
      cy.get('.p-4 > .grid > :nth-child(1) > div')
        .should('not.exist')

      //verify Error Text 2 should no longer exist
      cy.get('.p-4 > .grid > :nth-child(2) > div')
        .should('not.exist')
     
      //Click again the Check/Submit/Save button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].check_submit_save_button)
        .wait(2000)

      //verify success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
      .should('exist')
      .then(()=>{
        //verify the message inside
        cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
          .should('exist')
          .and('have.text', 'Template has been created.')
          .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
          .and('have.css', 'font-weight', '400')  //font bold
        //verify check mark logo
        cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
          .should('exist')
          .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
      })
      ///// REQUIRED FIELDS ASSERTIONS ENDS HERE //////////
      
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //verify under the Onboarding task that the recently added task should fall under 
      cy.get('div.space-y-8 > div.space-y-8 > div')
        .should('exist')
        .within(()=>{
          //assert the svg > then click
          cy.get('.col-span-3 > .cursor-pointer')
            .should('exist')
            .and('not.be.disabled')
            .click().wait(1000)
        })

      //as expected it should reveal the Entered formed
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
        .should('exist')

      //if I click again the button Onboarding task, the entered formed should hide 
      cy.get('.col-span-3 > .cursor-pointer')
        .click().wait(1000)
  
      //as expected it should not reveal the Entered formed
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
        .should('not.exist')
  
      //if I click again the button Onboarding task, the entered formed should be visible
      cy.get('.col-span-3 > .cursor-pointer')
        .click().wait(1000)

      //as expected it should reveal the Entered formed
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
        .should('exist')

      //// EDIT EXISTING TASK STARTS HERE //////
      //I am going to click the Edit button
      cy.get('.space-x-2 > .border-secondary')
        .click()
        .wait(2000)

      //verify Task name becomes an input field
      cy.get('form > div.py-4 > div.grid > div:nth-child(1) > input')
        .should('exist')
        .and('have.value', 'New Task Added Under Onboarding Task')
      
      //verify Task Description becomes an input field
      cy.get('form > div.py-4 > div.grid > div:nth-child(2) > input')
        .should('exist')
        .and('have.value', 'This description is for the recently added task under the Onboarding task')

      //Then here I will edi the Task Name
      cy.get('form > div.py-4 > div.grid > div:nth-child(1) > input')
        .clear()
        .type('Editted Task Name')
        .wait(1000)
        .should('have.value', 'Editted Task Name')

      //Then here I will edi the Task Description
      cy.get('form > div.py-4 > div.grid > div:nth-child(2) > input')
        .clear()
        .type('Editted Task Description')
        .wait(1000)
        .should('have.value', 'Editted Task Description')

      //Click the previously edit now check/save/submit button
      cy.get('.space-x-2 > .border-secondary')
        .click()
        .wait(2000)

      //verify success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'Template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
      //// EDIT EXISTING TASK ENDS HERE //////
      /// DELETE EXISTING TASK STARTS HERE ////
      //Click the Delete button
      cy.get('.space-x-2 > button.border-grayscale-700')
        .click()
        .wait(1000)

      //verify success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'Template has now been deleted from the system')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //i will verify that the entire form should completely removed under the Onboarding task
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2) > div')
        .should('not.exist')

      //instead what should remain is the text saying 'No Items'
      cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2) > p')
        .should('exist')
        .and('have.text', 'No Items')
      /// DELETE EXISTING TASK ENDS HERE ////

      /// ADD THREE TASKS STARTS HERE ////
      taskM.AddOnboardingTask('Task Onboarding One', 'This description is for this newly added Task Onboarding One', adminmodule.TaskManagementFolder[1].AddTaskButton, clientmodules.terminate[0].alertmessagemodal[0].modal, clientmodules.terminate[0].alertmessagemodal[0].message, clientmodules.terminate[0].alertmessagemodal[0].checklogo)
      taskM.AddOnboardingTask('Task Onboarding Two', 'This description is for this newly added Task Onboarding Two', adminmodule.TaskManagementFolder[1].AddTaskButton, clientmodules.terminate[0].alertmessagemodal[0].modal, clientmodules.terminate[0].alertmessagemodal[0].message, clientmodules.terminate[0].alertmessagemodal[0].checklogo)
      taskM.AddOnboardingTask('Task Onboarding Three', 'This description is for this newly added Task Onboarding Three', adminmodule.TaskManagementFolder[1].AddTaskButton, clientmodules.terminate[0].alertmessagemodal[0].modal, clientmodules.terminate[0].alertmessagemodal[0].message, clientmodules.terminate[0].alertmessagemodal[0].checklogo)
      /// ADD TWO TASKS ENDS HERE ////
          
      //verify under the Onboarding Task that the added multiple tasks are present
      //Since I add three tasks, then the count total that appear beside the title Onboarding tasks should also be the same
      cy.get('div.space-y-8 > div.space-y-8 > div > div.bg-white > div > div').its('length').then(($rows)=>{
        const totaltasks = String($rows);
        cy.log(`The Total Tasks Added - > ${totaltasks}`);

        cy.get('div.space-y-8 > div.space-y-8 > div > div > div > p > span:nth-child(2)')
          .should('exist')
          .and('have.text', `${totaltasks} tasks`)
          .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          .and('have.css', 'font-weight', '400') // font bold
          .and('have.css', 'font-size', '11px') //font size
      })  */
    })
    it("Testcase ID: CATM00022 - Add > Edit > Delete Task to Onboarding Task in Existing Existing Onboarding Template Task",()=>{


      //calling AddTaskAtTaskManagement
      const taskM = new AddTaskManagements();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //I now click the Existing Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].ExistingTab)
        .wait(2000)

       // I will click the edit button of the row 1 task
       cy.get('table > tbody > tr:first-child > td:nth-child(6) > a')
       .click()
       .wait(2000)
     
     //Click the Task Add button
     cy.click_link_button(adminmodule.TaskManagementFolder[1].AddTaskButton)
       .wait(2000)

     //verify that there is Enter Task Name elements, Enter Task Description, check and delete buttons showed up after you click the Task Add button
     //basically an entire add task form
     cy.get('div.main-content-inner2 > div > div > form')
       .should('exist')
       .within(()=>{
         //assert Task Name input field
         cy.get(adminmodule.TaskManagementFolder[1].taskNameInputfield)
           .should('exist')
           .and('not.be.disabled')
           .and('have.attr', 'placeholder', 'Enter task name')
           .and('have.value', '')  //by default, it is empty
         //assert Task Description input field
         cy.get(adminmodule.TaskManagementFolder[1].taskDescriptionInputfield)
           .should('exist')
           .and('not.be.disabled')
           .and('have.attr', 'placeholder', 'Enter task description')
           .and('have.value', '')  //by default, it is empty
         //assert check/submit/save button
         cy.get(adminmodule.TaskManagementFolder[1].check_submit_save_button)
           .should('exist')
           .and('not.be.disabled')
           .and('have.css', 'background-color', 'rgb(0, 47, 93)') // background color that forms a square button
           .and('have.css', 'border-color', 'rgb(0, 47, 93)') //the outline color of the background color
           .and('have.css', 'border-radius', '10px') // the curve edge
           .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(255, 255, 255)') // check mark color
         //assert delete button
         cy.get(adminmodule.TaskManagementFolder[1].deletebutton)
           .should('exist')
           .and('not.be.disabled')
           .and('have.css', 'background-color', 'rgb(255, 255, 255)') // background color that forms a square button
           .and('have.css', 'border-color', 'rgb(148, 148, 148)') //the outline color of the background color
           .and('have.css', 'border-radius', '10px') // the curve edge
           .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(148, 148, 148)') // x mark color
       })
     
     //Now if I click the delete button, the entire entry form should not be visible
     cy.get(adminmodule.TaskManagementFolder[1].deletebutton).click().wait(2000)
     
     //Entry form should no longer exist
     cy.get('div.main-content-inner2 > div > div > form')
       .should('not.exist')

     //Click again the Task Add button
     cy.click_link_button(adminmodule.TaskManagementFolder[1].AddTaskButton)
       .wait(2000)

     ///// REQUIRED FIELDS ASSERTIONS STARTS HERE //////////
     //Click the check/submit/save button
     cy.click_link_button(adminmodule.TaskManagementFolder[1].check_submit_save_button)
       .wait(2000)

     //verify Error Text 1 appeared below the Task name input field
     cy.get('.p-4 > .grid > :nth-child(1) > div')
       .should('exist')
       .and('have.text', 'title is a required field')
       .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

     //verify Error Text 2 appeared below the Task Description input field
     cy.get('.p-4 > .grid > :nth-child(2) > div')
       .should('exist')
       .and('have.text', 'description is a required field')
       .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

     //Now Enter Task Name
     cy.get(adminmodule.TaskManagementFolder[1].taskNameInputfield).type('New Task Added Under Onboarding Task')
       .wait(1000)
       .should('have.value', 'New Task Added Under Onboarding Task')

     //Click check/submit/save button
     cy.click_link_button(adminmodule.TaskManagementFolder[1].check_submit_save_button)
       .wait(2000)

     //Verify Error Text 1 should no longer exist
     cy.get('.p-4 > .grid > :nth-child(1) > div')
       .should('not.exist')

     //verify Error Text 2 still exist below the Task Description input field
     cy.get('.p-4 > .grid > :nth-child(2) > div')
       .should('exist')
       .and('have.text', 'description is a required field')
       .and('have.css', 'color', 'rgb(185, 28, 28)') // text color

     //Enter Task Description
     cy.get(adminmodule.TaskManagementFolder[1].taskDescriptionInputfield).type('This description is for the recently added task under the Onboarding task')
       .wait(1000)
       .should('have.value', 'This description is for the recently added task under the Onboarding task')

     //Verify Error Text 1 should no longer exist
     cy.get('.p-4 > .grid > :nth-child(1) > div')
       .should('not.exist')

     //verify Error Text 2 should no longer exist
     cy.get('.p-4 > .grid > :nth-child(2) > div')
       .should('not.exist')
    
     //Click again the Check/Submit/Save button
     cy.click_link_button(adminmodule.TaskManagementFolder[1].check_submit_save_button)
       .wait(2000)

     //verify success message popup
     cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
     .should('exist')
     .then(()=>{
       //verify the message inside
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
         .should('exist')
         .and('have.text', 'Template has been created.')
         .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
         .and('have.css', 'font-weight', '400')  //font bold
       //verify check mark logo
       cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
         .should('exist')
         .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
     })
     ///// REQUIRED FIELDS ASSERTIONS ENDS HERE //////////
     
     // I will close the Termination Request modal by pressing the esc key
     cy.get('body').type('{esc}'); // pressing esc button of the keyboard
     cy.wait(2000)

     //verify under the Onboarding task that the recently added task should fall under 
     cy.get('div.space-y-8 > div.space-y-8 > div')
       .should('exist')
       .within(()=>{
         //assert the svg > then click
         cy.get('.col-span-3 > .cursor-pointer')
           .should('exist')
           .and('not.be.disabled')
           .click().wait(1000)
       })

     //as expected it should reveal the Entered formed
     cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
       .should('exist')

     //if I click again the button Onboarding task, the entered formed should hide 
     cy.get('.col-span-3 > .cursor-pointer')
       .click().wait(1000)
 
     //as expected it should not reveal the Entered formed
     cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
       .should('not.exist')
 
     //if I click again the button Onboarding task, the entered formed should be visible
     cy.get('.col-span-3 > .cursor-pointer')
       .click().wait(1000)

     //as expected it should reveal the Entered formed
     cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2)')
       .should('exist')

     //// EDIT EXISTING TASK STARTS HERE //////
     //I am going to click the Edit button
     cy.get('.space-x-2 > .border-secondary')
       .click()
       .wait(2000)

     //verify Task name becomes an input field
     cy.get('form > div.py-4 > div.grid > div:nth-child(1) > input')
       .should('exist')
       .and('have.value', 'New Task Added Under Onboarding Task')
     
     //verify Task Description becomes an input field
     cy.get('form > div.py-4 > div.grid > div:nth-child(2) > input')
       .should('exist')
       .and('have.value', 'This description is for the recently added task under the Onboarding task')

     //Then here I will edit the Task Name
     cy.get('form > div.py-4 > div.grid > div:nth-child(1) > input')
       .clear()
       .type('Editted Task Name')
       .wait(1000)
       .should('have.value', 'Editted Task Name')

     //Then here I will edit the Task Description
     cy.get('form > div.py-4 > div.grid > div:nth-child(2) > input')
       .clear()
       .type('Editted Task Description')
       .wait(1000)
       .should('have.value', 'Editted Task Description')

     //Click the previously edit now check/save/submit button
     cy.get('.space-x-2 > .border-secondary')
       .click()
       .wait(2000)

     //verify success message popup
     cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
       .should('exist')
       .then(()=>{
         //verify the message inside
         cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
           .should('exist')
           .and('have.text', 'Template has been successfully updated.')
           .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
           .and('have.css', 'font-weight', '400')  //font bold
         //verify check mark logo
         cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
           .should('exist')
           .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
       })

     // I will close the Termination Request modal by pressing the esc key
     cy.get('body').type('{esc}'); // pressing esc button of the keyboard
     cy.wait(2000)
     //// EDIT EXISTING TASK ENDS HERE //////
     /// DELETE EXISTING TASK STARTS HERE ////
     //Click the Delete button
     cy.get('.space-x-2 > button.border-grayscale-700')
       .click()
       .wait(1000)

     //verify success message popup
     cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
       .should('exist')
       .then(()=>{
         //verify the message inside
         cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
           .should('exist')
           .and('have.text', 'Template has now been deleted from the system')
           .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
           .and('have.css', 'font-weight', '400')  //font bold
         //verify check mark logo
         cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
           .should('exist')
           .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
       })

     // I will close the Termination Request modal by pressing the esc key
     cy.get('body').type('{esc}'); // pressing esc button of the keyboard
     cy.wait(2000)

     //i will verify that the entire form should completely removed under the Onboarding task
     cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2) > div')
       .should('not.exist')

     //instead what should remain is the text saying 'No Items'
     cy.get('div.space-y-8 > div.space-y-8 > div > div:nth-child(2) > p')
       .should('exist')
       .and('have.text', 'No Items')
     /// DELETE EXISTING TASK ENDS HERE ////

     /// ADD THREE TASKS STARTS HERE ////
     taskM.AddOnboardingTask('Task Onboarding One', 'This description is for this newly added Task Onboarding One', adminmodule.TaskManagementFolder[1].AddTaskButton, clientmodules.terminate[0].alertmessagemodal[0].modal, clientmodules.terminate[0].alertmessagemodal[0].message, clientmodules.terminate[0].alertmessagemodal[0].checklogo)
     taskM.AddOnboardingTask('Task Onboarding Two', 'This description is for this newly added Task Onboarding Two', adminmodule.TaskManagementFolder[1].AddTaskButton, clientmodules.terminate[0].alertmessagemodal[0].modal, clientmodules.terminate[0].alertmessagemodal[0].message, clientmodules.terminate[0].alertmessagemodal[0].checklogo)
     taskM.AddOnboardingTask('Task Onboarding Three', 'This description is for this newly added Task Onboarding Three', adminmodule.TaskManagementFolder[1].AddTaskButton, clientmodules.terminate[0].alertmessagemodal[0].modal, clientmodules.terminate[0].alertmessagemodal[0].message, clientmodules.terminate[0].alertmessagemodal[0].checklogo)
     /// ADD TWO TASKS ENDS HERE ////
         
     //verify under the Onboarding Task that the added multiple tasks are present
     //Since I add three tasks, then the count total that appear beside the title Onboarding tasks should also be the same
     cy.get('div.space-y-8 > div.space-y-8 > div > div.bg-white > div > div').its('length').then(($rows)=>{
       const totaltasks = String($rows);
       cy.log(`The Total Tasks Added - > ${totaltasks}`);

       cy.get('div.space-y-8 > div.space-y-8 > div > div > div > p > span:nth-child(2)')
         .should('exist')
         .and('have.text', `${totaltasks} tasks`)
         .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
         .and('have.css', 'font-weight', '400') // font bold
         .and('have.css', 'font-size', '11px') //font size
     })
    })
    it("Testcase ID: CATM00023 - Add > Edit > Delete Task to New > Recurring Task ",()=>{


      //calling AddTaskAtTaskManagement
      const taskM = new AddTaskManagements();

      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //click the Admin nav module
      cy.click_link_button(clientmodulesnavlink.adminnavlink)
        .wait(2000)

      //now I am going to click the Task Management folder link
      cy.click_link_button(adminmodule.adminmoduleLinkFolders[0].TaskManagementFolderLink)
        .wait(3000)

      //Click the Recurring Tab
      cy.click_link_button(adminmodule.TaskManagementFolder[0].RecurringTab)
        .wait(2000)

      //I will select the row 1 recurring task
      cy.click_link_button('table > tbody > tr:first-child > td:nth-child(6) > a')
        .wait(2000)
      
      //Click the Task Add button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].AddTaskButton)
        .wait(2000)

      //verify that there is Enter Task Name elements, Enter Task Description, check and delete buttons showed up after you click the Task Add button
      //basically an entire add task form
      cy.get('div.main-content-inner2 > div > div > form')
        .should('exist')
        .within(()=>{
          //assert Task Name input field
          cy.get(adminmodule.TaskManagementFolder[1].taskNameInputfield)
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'placeholder', 'Enter task name')
            .and('have.value', '')  //by default, it is empty
          //assert Task Description input field
          cy.get(adminmodule.TaskManagementFolder[1].taskDescriptionInputfield)
            .should('exist')
            .and('not.be.disabled')
            .and('have.attr', 'placeholder', 'Enter task description')
            .and('have.value', '')  //by default, it is empty
          //assert Recurring button
          cy.get(adminmodule.TaskManagementFolder[1].recurringbutton)
            .should('exist')
            .and('not.be.disabled')
            .within(()=>{
              //assert svg icon
              cy.get('svg')
                .should('exist')
                .and('not.be.disabled')
              //assert label
              cy.get('label')
                .should('exist')
                .and('have.text', 'Recurring')
                .and('have.css', 'color', 'rgb(107, 114, 128)') //text color
            })
          //assert Select Department
          cy.get(adminmodule.TaskManagementFolder[1].departmentselectmenu)
            .should('exist')
            .and('not.be.disabled')
            .within(()=>{
              //expected options
              const selectCategoryOptions = [
                ' Select Department',
                'SI-Operations',
                'SI-PPC',
                'SI-Writing',
                'SI-Design',
                'SI-Admin',
                'Billing',
                'Sales',
                'Lead Generation'
              ] 
              cy.get('option').each(($option, index) => {
                cy.wrap($option).should('have.text', selectCategoryOptions[index]) //verify names based on the expected options
                .should('exist')
                .and('not.be.disabled')
                cy.log(selectCategoryOptions[index]) 
              })
            })
          //assert check/submit/save button
          cy.get(adminmodule.TaskManagementFolder[1].check_submit_save_button)
            .should('exist')
            .and('not.be.disabled')
            .and('have.css', 'background-color', 'rgb(0, 47, 93)') // background color that forms a square button
            .and('have.css', 'border-color', 'rgb(0, 47, 93)') //the outline color of the background color
            .and('have.css', 'border-radius', '10px') // the curve edge
            .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(255, 255, 255)') // check mark color
          //assert delete button
          cy.get(adminmodule.TaskManagementFolder[1].deletebutton)
            .should('exist')
            .and('not.be.disabled')
            .and('have.css', 'background-color', 'rgb(255, 255, 255)') // background color that forms a square button
            .and('have.css', 'border-color', 'rgb(148, 148, 148)') //the outline color of the background color
            .and('have.css', 'border-radius', '10px') // the curve edge
            .find('svg').should('exist').and('be.visible').and('have.css', 'color', 'rgb(148, 148, 148)') // x mark color
        })
      
      //Now if I click the delete button, the entire entry form should not be visible
      cy.get(adminmodule.TaskManagementFolder[1].deletebutton).click().wait(2000)
      
      //Entry form should no longer exist
      cy.get('div.main-content-inner2 > div > div > form')
        .should('not.exist')
      
      //Now I will click again the Task Add button
      cy.click_link_button(adminmodule.TaskManagementFolder[1].AddTaskButton)
        .wait(2000)

      ///// REQUIRED ASSERTIONS STARTS HERE ////////
      
      //Without any data entered to any fields, I will click the check/submit/save button
      cy.get(adminmodule.TaskManagementFolder[1].check_submit_save_button).click().wait(2000)

      //verify Error Text 1 For Enter Task Name - title is a required field
      cy.get('.p-4 > .grid > :nth-child(1) > div')
        .should('exist')
        .and('have.text', 'title is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 2 For Enter Task Description - description is a required field
      cy.get('.p-4 > .grid > :nth-child(2) > div')
        .should('exist')
        .and('have.text', 'description is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color
      
      //verify Error Text 3 For Select Department - department is a required field
      cy.get('.p-4 > .grid > :nth-child(4) >div')
        .should('exist')
        .and('have.text', 'department is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color
        
      //Now I am going to Enter Task Name
      cy.get(adminmodule.TaskManagementFolder[1].taskNameInputfield)
        .clear()
        .type('Operations Task')
        .wait(1000)
        .should('have.value', 'Operations Task')

      //click again the check/submit/save button
      cy.get(adminmodule.TaskManagementFolder[1].check_submit_save_button).click().wait(2000)

      //verify Error Text 1 should no longer exist
      cy.get('.p-4 > .grid > :nth-child(1) > div')
        .should('not.exist')

      //verify Error Text 2 For Enter Task Description - description is a required field
      cy.get('.p-4 > .grid > :nth-child(2) > div')
        .should('exist')
        .and('have.text', 'description is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color
      
      //verify Error Text 3 For Select Department - department is a required field
      cy.get('.p-4 > .grid > :nth-child(4) >div')
        .should('exist')
        .and('have.text', 'department is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now I am going to Enter Task Description
      cy.get(adminmodule.TaskManagementFolder[1].taskDescriptionInputfield)
        .clear()
        .type('Operations Task Description')
        .wait(1000)
        .should('have.value', 'Operations Task Description')

      //click again the check/submit/save button
      cy.get(adminmodule.TaskManagementFolder[1].check_submit_save_button).click().wait(2000)

      //verify Error Text 2 For Enter Task Description - description is a required field
      cy.get('.p-4 > .grid > :nth-child(2) > div')
        .should('not.exist')

      //verify Error Text 3 For Select Department - department is a required field
      cy.get('.p-4 > .grid > :nth-child(4) >div')
        .should('exist')
        .and('have.text', 'department is a required field')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now I am going to select a SI-Operations Department
      cy.get(adminmodule.TaskManagementFolder[1].departmentselectmenu).select('SI-OPERATIONS').should('have.value', 'SI-OPERATIONS')

      //this will verify that when the newly added upsell item was selected, it did appeared on top
      cy.get('.p-4 > .grid > :nth-child(4) > select option:selected').should('have.text', 'SI-Operations');

      //verify that the Error Text 3 should no longer exist
      cy.get('.p-4 > .grid > :nth-child(4) >div')
        .should('not.exist')

      //Click the Submit/check/save button
      cy.get(adminmodule.TaskManagementFolder[1].check_submit_save_button).click().wait(2000)

      //verify success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'Template has been created.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
      ///// REQUIRED ASSERTIONS ENDS HERE ////////
        
      //verify that the recently created task should reside in the SI-Operations Task department
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1)')
        .should('exist')
        .within(()=>{
          //assert svg button
          cy.get(' > div:nth-child(1) > div > div > svg')
            .should('exist')
            .and('not.be.disabled')
          //assert total task under the SI-Operations as it should be 1
          cy.get(' > div > div > p > span:nth-child(2)')
            .should('exist')
            .and('have.text', '1 task')
            .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
            .and('have.css', 'font-weight', '400') //font bold
            .and('have.css', 'font-size', '11px')

      //in here in order to assert the Tasked forme elements i have to click first the button on the side of the Operations Tasks title department
      cy.get(' > div:nth-child(1) > div > div > svg').click().wait(1000);

      //assert the added task formed elements
      cy.get(' > div:nth-child(2)')
        .should('exist')
        
      //assert expected column names for the added task formed elements
      const columnNames = [
        'Description',
        'Recurring',
        'Department',
        'Actions'
      ];
      cy.get(' > div:nth-child(1) > p').each(($option, index) => {
        cy.wrap($option).should('have.text', columnNames[index]) //verify names based on the expectation
          .should('exist')
          .and('have.css', 'color', 'rgb(148, 148, 148)') //text color
          cy.log(columnNames[index]) 
      });

      //assert the Entered Task Name
      cy.get(' > div:nth-child(2) > div > div > div > p:nth-child(1)')
        .should('exist')
        .and('have.text', 'Operations Task')
        
      //assert the Entered Task Description  
      cy.get(' > div:nth-child(2) > div > div > div > p:nth-child(2)')
        .should('exist')
        .and('have.text', 'Operations Task Description')

      //assert Default > Recurring
      cy.get(' > div:nth-child(2) > div > div > div > p:nth-child(3)')
        .should('exist')
        .and('have.text', 'Recurring')

      //assert the selected Department > SI-OPERATIONS
      cy.get(' > div:nth-child(2) > div > div > div > div:nth-child(4) > p')
        .should('exist')
        .and('have.text', 'SI-OPERATIONS')
        .and('have.css', 'color', 'rgb(0, 47, 93)') //text color
        .and('have.css', 'background-color', 'rgb(211, 228, 245)') //background color that forms like a capsule
        .and('have.css', 'border-radius', '40px') //the curve edges of the background color

      //assert edit button
      cy.get(' > div:nth-child(2) > div > div > div > div:nth-child(5) > button:nth-child(1)')
        .should('exist')
        .and('not.be.disabled')
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') //background color that forms like a square
        .and('have.css', 'border-radius', '10px') //the curve edges of the background color
        .find('svg').should('exist').and('have.css', 'color', 'rgb(255, 255, 255)') //svg color

      //assert delete button
      cy.get(' > div:nth-child(2) > div > div > div > div:nth-child(5) > button:nth-child(2)')
        .should('exist')
        .and('not.be.disabled')
        .and('have.css', 'border-color', 'rgb(148, 148, 148)') //border color outline that forms like a square
        .and('have.css', 'border-radius', '10px') //the curve edges of the background color
        .find('svg').should('exist').and('have.css', 'color', 'rgb(148, 148, 148)') //svg color
      })
    
      //Now if I am going to click again the button of the SI-Operations task department, the entered form together with the columns names should not be visible
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(1) > div > div > svg')
        .click()
        .wait(2000)

      //assert the added task formed elements
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(2)')
        .should('not.exist')

      ///// EDIT TASKS STARTS HERE ///////
      //click again the button beside the SI-OPERATIONS TASK Title
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(1) > div > div > svg')
        .click()
        .wait(2000)

      //assert the added task formed elements
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(2)')
        .should('exist')

      //Click the Edit button
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(2) > div > div > div > div:nth-child(5) > button:nth-child(2)')
        .click()
        .wait(2000)

      //verify the previously plain text entered task name element becomes input field that can be editted
      cy.get("div > input[name='title']")
        .should('exist')
        .and('not.be.disabled')
        .and('have.value', 'Operations Task')
        .clear()
        .type('Editted Task Name')
        .wait(1000)
        .should('have.value', 'Editted Task Name')
      
      //verify the previously plain text entered task description becomes input field and can be editted
      cy.get("div > input[name='description']")
        .should('exist')
        .and('not.be.disabled')
        .and('have.value', 'Operations Task Description')
        .clear()
        .type('Editted Task description')
        .wait(1000)
        .should('have.value', 'Editted Task description')

      //I now click the check/submit/save button
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(2) > div > div > div > div:nth-child(5) > button:nth-child(2)')
        .click()
        .wait(2000)

      //verify success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'Template has been successfully updated.')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })
      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)
      ///// EDIT TASKS ENDS HERE ///////

      //Click the Delete button of the task
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(2) > div > div > div > div:nth-child(5) > button:nth-child(2)')
        .click()
        .wait(2000)

      //verify success message popup
      cy.get(clientmodules.terminate[0].alertmessagemodal[0].modal)
        .should('exist')
        .then(()=>{
          //verify the message inside
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].message)
            .should('exist')
            .and('have.text', 'Template has now been deleted from the system')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
            .and('have.css', 'font-weight', '400')  //font bold
          //verify check mark logo
          cy.get(clientmodules.terminate[0].alertmessagemodal[0].checklogo)
            .should('exist')
            .and('have.css', 'color', 'rgb(0, 150, 109)') //text color
        })

      // I will close the Termination Request modal by pressing the esc key
      cy.get('body').type('{esc}'); // pressing esc button of the keyboard
      cy.wait(2000)

      //verify that in the SI-OPERATIONS TASK title, there is no more count of total task
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div > div > p > span:nth-child(2)')
        .should('not.exist')

      //verify that there is no more that tasked formed elements as well
      cy.get('div.space-y-8 > div.space-y-8 > div:nth-child(1) > div:nth-child(2)')
        .should('not.exist')
    })
    // **** CLIENT ADMIN TASK MANAGEMENT ENDS HERE ***
    // **** THESE TEST CASES ARE NOT INCLUDED FOR PROJECT TESTING BUT RATHER FOR ANY TRIALS STARTS HERE ***
    it.skip('trials pagination 1',()=>{
      
      let clienturl;

      //calling utility functions
      const utilfunc = new utilityfunctions();

      //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
      
      //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //I will also go to Inactive Clients and expect the client to be there in the table
      cy.click_link_button(clientmodules.clientmodulesubfolderslink[0].inactiveclients)
        .wait(2000)

        let totalpages;
        //GET the total pages, on the web you'll find on the lower right of the table ex. ' 1 0f 7 '; which means 7 is the total pages
      cy.get('div[aria-current="page"]')
        .should('exist')
        .and('be.visible')
        .then((txt)=>{
          cy.log('raw text '+txt.text().trim());
          totalpages = txt.text().trim().slice(5, 6);
          cy.log(`Current Total pages in the table > ${totalpages}`)
          totalpages = parseInt(totalpages, 10); // convert to integer
        })
     

        let found = false;
        const expectedText = 'alpaka';
        
        cy.get('table > tbody').within(() => {
          cy.get('tr').each(($row, rowIndex) => {
            if (!found) {
              cy.wrap($row)
                .find('td:first-child') // Select the first column <td> in each row
                .invoke('text')
                .then((columnText) => {
                  // Perform your assertions on `columnText` here
                  if (columnText.trim() === expectedText) {
                    cy.log(`Client Name isFound -> ${columnText} in row -> ${rowIndex}`)
                    found = true; // Set the flag to true if the text is found
                    cy.wrap(false).as('breakLoop'); // Use cy.wrap() to break the loop
                  }
                });
            }
          });
        });
        
        // Check if the loop should be broken
        cy.get('@breakLoop').then((shouldBreak) => {
          if (shouldBreak) {
            // Actions to be performed when the loop should break
            // For example:
            cy.log('Expected text found. Loop breaking.');
          }
        });
        
        /*
        ///previously working 
        cy.get('table > tbody > tr').its('length').then((rowCount)=>{
          cy.log(`Total rows in first page is ${rowCount}`)
            for (let i = 0; i < rowCount; i++) {
              cy.get('table > tbody > tr').eq(i).within(() => {
                // Within each row, find the text in the first column (td)
                cy.get('td:eq(0)').invoke('text').then((columnText) => {
                  if (columnText.includes(name)) {
                    // Do something when the specific text is found in the row
                    cy.log(`The Recently Terminated Client ${name} isFound in row = ${i}`);
                    //then i am going to get the url of such client
                    cy.get('td a')
                      .invoke('attr', 'href')
                      .then((href)=>{
                        clienturlforpagination = href;
                      })
                    //verify at Terminated At in the column 7 
                    cy.get('td:nth-child(7) > div > span')
                      .should('exist')
                      .and('be.visible')
                      .and('have.text', utilfunc.getFormattedDateDayMonthyear())
                    cy.get('td:nth-child(7) > div > svg') // at the side of the terminated date there is pen icon for edit
                      .should('exist')
                      .and('be.visible')
                      .and('not.be.disabled')
                    //verify at Terminated Reason column in column 8 
                    cy.get('td:nth-child(8)')
                      .should('exist')
                      .and('be.visible')
                      .and('have.text', 'Design Issues')
                    return false; // This breaks out of the .each() loop if client name is found
                  }
                });
              });
            }
        })
        ///previously working 
        */



          /*
        for (let i = 1; i < rowCount; i++) {
          cy.get('table > tbody > tr').eq(i).within(() => {
            // Within each row, find the text in the first column (td)
            cy.get('td:eq(0)').invoke('text').then((columnText) => {
              if (columnText.includes('box out')) {
                // Do something when the specific text is found in the row
                cy.log('The Recently Terminated Client isFound in row = '+i);
                //then i am going to get the url of such client
                cy.get('td a')
                  .invoke('attr', 'href')
                  .then((href)=>{
                    clienturl = href;
                })
                return false; // This breaks out of the .each() loop if client name is found
              }
            });
          });
        } */

       /*
      cy.get('body').then(()=>{
        cy.visit('https://agency.test.better-seller.betterseller.com'+clienturl).wait(3000);
      })
  

      
      //verify the what was used to be a terminate link button is now 'Terminated last yyyy-mm-dd
      cy.get('div.main-content-inner2 > div > div p.text-error-dark')
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  //text color
        .and('have.css', 'background-color', 'rgb(255, 175, 175)')  // the background color that shape like a capsule
        .and('have.css', 'border-radius', '40px')
        //.and('have.text', 'Terminated last '+utilfunc.getFormattedDateYearMonthDay()) */
    })
    it.skip('trials pagination 2',()=>{


      let clienturl;

      //calling utility functions
      const utilfunc = new utilityfunctions();
      /*
      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
        */
      //login using account specialist
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.accountspecialist, useraccountdata.accountspecialistandprojectmanagerpassword)
      

      //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //I will also go to Inactive Clients and expect the client to be there in the table
      cy.click_link_button(clientmodules.clientmodulesubfolderslink[0].inactiveclients)
        .wait(2000)

      //GET the total pages
      let totalpages;  
      cy.get('div[aria-current="page"]')
        .should('exist')
        .and('be.visible')
        .then((txt)=>{
          totalpages = txt.text().trim().slice(5, 6);
          cy.log(`Current Total pages in the table is ${totalpages}`)
          totalpages = parseInt(totalpages, 10); //convert to enteger
        })
        
      //GET the total rows in the first page
      cy.get('table > tbody > tr').then(() => {
        if(totalpages > 1){
          cy.log(` HAHAY ${totalpages}`)

          for(let i = 0; i < totalpages; i++){
            cy.get('table > tbody > tr').eq(i).within(() => {
              // Within each row, find the text in the first column (td)
              cy.get('td:eq(0)').invoke('text').then((columnText) => {
                if (columnText.includes('Figarland')) {
                  // Do something when the specific text is found in the row
                  cy.log(`Found is in row = ${i}`);
                  //then i am going to get the url
                  cy.get('td a')
                    .invoke('attr', 'href')
                    .then((href)=>{
                      clienturl = href;
                  })
                  return false; // This breaks out of the .each() loop if client name is found
                }
              });
            });
          } // END OF FOR LOOP
        }else{ // it means there is only 1 page
          cy.get('table > tbody > tr').its('length').then((rowCount) => {
            cy.log(`Total rows in the table: ${rowCount}`);
            
            for (let i = 0; i < rowCount; i++) {
              cy.get('table > tbody > tr').eq(i).within(() => {
                // Within each row, find the text in the first column (td)
                cy.get('td:eq(0)').invoke('text').then((columnText) => {
                  if (columnText.includes('box out')) {
                    // Do something when the specific text is found in the row
                    cy.log(`Found  in row ${i}`);
                    //then i am going to get the url
                    cy.get('td a')
                      .invoke('attr', 'href')
                      .then((href)=>{
                        clienturl = href;
                        cy.log('dasdasdasd '+clienturl)
                      })
                    return false; // This breaks out of the .each() loop if client name is found
                  } //END IF TEXT IS FOUND
                });
              });
            }
          }); 
        } //END ELSE FOR COMPARING totalapges......... 
      })

      //now visit to that found client
      cy.get('body').then(()=>{
        cy.visit('https://agency.test.better-seller.betterseller.com'+clienturl).wait(3000);
      })
     
      //verify the what was used to be a terminate link button is now 'Terminated last yyyy-mm-dd
      cy.get('div.main-content-inner2 > div > div p.text-error-dark')
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  //text color
        .and('have.css', 'background-color', 'rgb(255, 175, 175)')  // the background color that shape like a capsule
        .and('have.css', 'border-radius', '40px')
        //.and('have.text', 'Terminated last '+utilfunc.getFormattedDateYearMonthDay())  
      
    })
    it.skip('trials pagination 3',()=>{

  
      //calling utility functions
      const utilfunc = new utilityfunctions();
      //calling tablesearchpagination js 
     
      //login using admin role
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
     
      //click the Client module nav link
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //I will also go to Inactive Clients and expect the client to be there in the table
      cy.click_link_button(clientmodules.clientmodulesubfolderslink[0].inactiveclients)
        .wait(2000)


      // Usage: Call the function with the name you want to search for
      

      //now call the function 
      searchNameInTable('Figarland');
       
      //then visit the client profile page;
      cy.get('body').then(()=>{
        cy.visit('https://agency.test.better-seller.betterseller.com'+clienturlforpagination).wait(3000);
      })



      //verify the what was used to be a terminate link button is now 'Terminated last yyyy-mm-dd
      cy.get('div.main-content-inner2 > div > div p.text-error-dark')
        .should('exist')
        .and('be.visible')
        .and('have.css', 'color', 'rgb(195, 0, 0)')  //text color
        .and('have.css', 'background-color', 'rgb(255, 175, 175)')  // the background color that shape like a capsule
        .and('have.css', 'border-radius', '40px')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
        //.and('have.text', 'Terminated last '+utilfunc.getFormattedDateYearMonthDay())  

    })
    // **** THESE TEST CASES ARE NOT INCLUDED FOR PROJECT TESTING BUT RATHER FOR ANY TRIALS ENDS HERE ***
})