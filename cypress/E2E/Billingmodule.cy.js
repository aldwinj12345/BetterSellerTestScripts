/// <reference types="cypress" />
import utilityfunctions from "../pageObjects/utilityfunctions.js"


let loginmodules;
let clientmodulesnavlink;
let useraccountdata;
let clientmodules;
let alertmessageslocators;
let billingmodule;

before('This would call files that are at the fixtures', ()=>{

    //initiating user accounts data
    cy.fixture('useraccounts').then((data)=>{
        useraccountdata=data;
    })
    //initiating the clientnavlinksmodules
    cy.fixture('clientnavlinksmodules').then((data)=>{
        clientmodulesnavlink=data;
    })
    //initiating the loginmodulelocators
    cy.fixture('loginmodulelocators').then((data)=>{
        loginmodules=data;
    })
    //initiating the clientmodulelocators
    cy.fixture('clientmodulelocators').then((data)=>{
        clientmodules=data;
    })
    //initiating alert messages
    cy.fixture('alertmessages').then((data)=>{
        alertmessageslocators=data;
    })
    //initiating billingmodulelocators
    cy.fixture('billingmodulelocators').then((data)=>{
        billingmodule=data;
    })
})

beforeEach('Launch BS Login Page', ()=>{

    cy.visit('https://agency.test.better-seller.betterseller.com/')
    cy.wait(3000)

    //change the window size of the browser
    cy.viewport(1600, 1100)
    //assert url - when launched sucessfully
    cy.url().should('eq','https://agency.test.better-seller.betterseller.com/sign-in')
    .and('contain','/sign-in')
})

//The test cases are based on the Jira Confluence 
describe('Billing Module Test Suite',()=>{
    
    //get utility functions 
    const utilfunc = new utilityfunctions();
    
    // **** BILLING CREATE UPSELL ITEMS STARTS HERE ***
  it('Testcase ID: BUI0001 - Add Addons/Upsell Items', ()=>{

    //login using admin role
    cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
    
    // Click the Billing Module
    cy.click_link_button(clientmodulesnavlink.billingnavlink)
      .wait(2000)

    //Verify the Upsell Items link text folder exist - then the default color
    cy.get(billingmodule.UpsellItems[0].UpsellItemslinktextfolder)
      .should('exist')
      .and('not.be.disabled')
      .and('have.text', 'Upsell Items')
      .and('have.css', 'font-weight', '500') // font bold
      .and('have.css', 'color', 'rgb(156, 163, 175)') // default text color - before clicking it
      .find('svg').should('exist').and('have.css', 'color', 'rgb(156, 163, 175)')

    // Now I am going to click the Upsell Items - as expected the text color changes
    cy.get(billingmodule.UpsellItems[0].UpsellItemslinktextfolder)
      .click()
      .wait(2000)
      .should('exist')
      .and('not.be.disabled')
      .and('have.text', 'Upsell Items')
      .and('have.css', 'font-weight', '500') // font bold
      .and('have.css', 'color', 'rgb(239, 68, 68)') // default text color - before clicking it
      .find('svg').should('exist').and('have.css', 'color', 'rgb(239, 68, 68)')

    //then verify the url expected destination
    cy.url().should('contain', '/addons')
    
    //verify the Upsell Items page title
    cy.get(billingmodule.UpsellItems[0].upsellitemmaintitlepage)
      .should('exist')
      .and('have.text', 'Addons / Upsell Items')
      .and('have.css', 'font-weight', '700') // font bold

    //verify Add button
    cy.get(billingmodule.UpsellItems[0].addbutton)
      .should('exist')
      .and('not.be.disabled')
      .and('have.text', ' Add')
      .and('have.css', 'font-weight', '700') // font bold
      .and('have.css', 'color', 'rgb(75, 85, 99)') //text color
      .and('have.css', 'border-color', 'rgb(75, 85, 99)') //the outline color that forms like a capsule
      .and('have.css', 'border-radius', '24px') //the curve edge

    //Click the Add button
    cy.click_link_button(billingmodule.UpsellItems[0].addbutton)
      .wait(2000)

    //verify Create Upsell Items modal popup
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
      .should('exist')

    //Verify Modal title
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modaltitle)
      .should('exist')
      .and('have.text', 'Create Upsell Item')
      .and('have.css', 'font-weight', '700') // font bold

    //verify Invoice Item Name
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemNameinputandlabel)
      .should('exist')
      .within(()=>{
        //assert label
        cy.get('label')
          .should('exist')
          .and('have.text', 'Invoice Item Name *')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //the words Invoice Item Name text color
          .find('sup').should('exist').and('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
        //assert input field
        cy.get('input')
          .should('exist')
          .and('not.be.disabled')
          .and('have.value', '') //empty by default
          .and('have.attr', 'placeholder', 'Add Invoice Item Name')
      })
    
    //verify Invoice Item Code
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemCodeinputandlabel)
      .should('exist')
      .within(()=>{
        //assert label
        cy.get('label')
          .should('exist')
          .and('have.text', 'Invoice Item Code *')
          .and('have.css', 'color', 'rgb(107, 114, 128)') //the words Invoice Item Code text color
          .find('sup').should('exist').and('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
        //assert input field
        cy.get('input')
          .should('exist')
          .and('not.be.disabled')
          .and('have.value', '') //empty by default
          .and('have.attr', 'placeholder', 'Add Invoice Item Code')
      })

      //verify Item Description
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ItemDescriptionfieldandlabel)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'Item Description')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //the words Invoice Item Description text color
          //assert textarea input field
          cy.get('textarea')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', 'Add information related to this upsell')
        })

      //verify One Time Fee
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].OneTimeFeeinputandlabel)
        .should('exist')
        .within(()=>{
          //assert label
          cy.get('label')
            .should('exist')
            .and('have.text', 'One Time Fee *')
            .and('have.css', 'color', 'rgb(107, 114, 128)') //the words One Time Fee text color
            .find('sup').should('exist').and('have.css', 'color', 'rgb(237, 46, 46)') //asterisk text color
          //assert input field
          cy.get('input')
            .should('exist')
            .and('not.be.disabled')
            .and('have.value', '') //empty by default
            .and('have.attr', 'placeholder', '$ Price')
        })

      //verify Cancel button
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].cancelbutton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')
        .and('have.css', 'color', 'rgb(24, 121, 216)') //text color

      //verify Save button
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
        .should('exist')
        .and('not.be.disabled')
        .and('have.text', 'Save')
        .and('have.css', 'color', 'rgb(250, 250, 250)') //text color
        .and('have.css', 'background-color', 'rgb(0, 47, 93)') // background color that forms like a capsule
        .and('have.css', 'border-radius', '9999px') // the curve edge

      /////// REQUIRED ASSERTIONS STARTS HERE /////////
      // I will click the Save button without enter any data to any of the required fields
      cy.click_link_button(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
        .wait(2000)

      //verify that the modal should remain open
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
      .should('exist')

      //verify Error Text 1 should exist - that should be under the Invoice Item Name field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText1)
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 2 should exist - that should be under the Invoice Item Code field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText2)
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 3 should exist - that should be within the One Time Fee field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText3)
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now I will Enter/Add Invoice Item Name
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemNameinputandlabel)
        .find('input')
        .type(`0000Aldwin Item Name ${utilfunc.getFormattedDate()}`)
        .wait(1000)
        .should('have.value', `0000Aldwin Item Name ${utilfunc.getFormattedDate()}`)

      //I will click again the Save button
      cy.click_link_button(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
        .wait(2000)

      //verify that the modal should remain open
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
      .should('exist')

      //verify that the Error Text 1 - under the Invoice Item Name field should not exist
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText1)
        .should('not.exist')

      //verify Error Text 2 should exist - that should be under the Invoice Item Code field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText2)
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //verify Error Text 3 should exist - that should be within the One Time Fee field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText3)
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //Now I will Enter/Add Invoice Item Code 
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemCodeinputandlabel)
        .find('input')
        .type('AItemCode012345')
        .wait(1000)
        .should('have.value', 'AItemCode012345')

      //I will click again the Save button
      cy.click_link_button(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
        .wait(2000)

      //verify that the modal should remain open
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
        .should('exist')

      //verify Error Text 2 should not exist - that should not exist under the Invoice Item Code field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText2)
        .should('not.exist')

      //verify Error Text 3 should exist - that should be within the One Time Fee field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText3)
        .should('exist')
        .and('have.text', 'Required')
        .and('have.css', 'color', 'rgb(185, 28, 28)') //text color

      //As an optional - I will Enter/Add Item Description
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ItemDescriptionfieldandlabel)
        .find('textarea')
        .type('This item description is only for testing purposes only.')
        .wait(1000)
        .should('have.value', 'This item description is only for testing purposes only.')

      //Now I will Enter/Add One Time Fee
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].OneTimeFeeinputandlabel)
        .find('input')
        .type('250')
        .wait(1000)
        .should('have.value', '250')
      
      //verify Error Text 3 should not exist - that should be within the One Time Fee field
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ErrorText3)
        .should('not.exist')

      //Click the Save button
      cy.click_link_button(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
        .wait(3000)

      //verify alert-error text message 
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Invoice item added')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Addon added')
      /////// REQUIRED ASSERTIONS ENDS HERE /////////
        
      ///// ADDONS/UPSELL ITEMS TABLE ASSERTIONS STARTS HERE ////////
      //i will assert first the column names in the table
      const columnNames = [
        'Name',
        'Code',
        'Description',
        'Price ($)',
        'Created By',
        'Action'
      ];
      cy.get('table > thead > tr > th').each(($option, index) => {
        cy.wrap($option).should('have.text', columnNames[index]) //verify names based on the expectation
          .should('exist')
          .and('have.css', 'color', 'rgb(190, 190, 190)') //text color
          .then((el)=>{
            const computedStyle = getComputedStyle(el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1');
          })
          cy.log(columnNames[index]) 
      });

      cy.get('table > tbody > tr:first-child').within(()=>{
        //assert column 1 > Name
        cy.get(' > td:nth-child(1)')
          .should('exist')
          .and('have.text', `0000Aldwin Item Name ${utilfunc.getFormattedDate()}`)
          .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        //assert column 2 > Code
        cy.get(' > td:nth-child(2)')
          .should('exist')
          .and('have.text', 'AItemCode012345')
          .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        //assert column 3 > Description
        cy.get(' > td:nth-child(3)')
          .should('exist')
          .and('have.text', 'This item description is only for testing purposes only.')
          .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
        //assert column 4 > Price
        cy.get(' > td:nth-child(4) > span')
          .should('exist')
          .and('have.text', '$250')
          .find('span').should('have.css', 'color', 'rgb(156, 163, 175)') //the dollar symbol color
        //assert column 5 > Create By
        cy.get(' > td:nth-child(5) ')
          .should('exist')
          .then(()=>{
            cy.get(' > td:nth-child(5) > div > span')  //account specialist name
              .should('exist')
              .then((txt)=>{
                expect(txt.text().replace(/\s+/g, ' ').trim()).to.equal('BS Admin')
              })  
            cy.get(' > td:nth-child(5) > div > div > div > div')  //the initial logo
              .should('exist')
              .and('have.text', 'B')
              .and('have.css', 'color', 'rgb(255, 255, 255)')         //text color
              .and('have.css', 'background-color', 'rgb(0, 47, 93)')  //background color
          })
        //assert column 6 > Action:Edit and Delete
        cy.get(' > td:nth-child(6) > div')
          .should('exist')
          .within(()=>{
            //assert edit button
            cy.get(' > button:nth-child(1)')
              .should('exist')
              .and('not.be.disabled')
              .and('have.css', 'color', 'rgb(0, 47, 93)')
            //assert delete button
            cy.get(' > button:nth-child(2)')
              .should('exist')
              .and('not.be.disabled')
              .and('have.css', 'color', 'rgb(0, 47, 93)')
          })
      })
      ///// ADDONS/UPSELL ITEMS TABLE ASSERTIONS ENDS HERE ////////

      //Then here I will verify in the Client > Billing > Upsell > Create Upsell modal > Upsell Item list drop-down that it reflects
      //Click the Client Navigation button
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //Select client test -> AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

      //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)
      
      // Click the Upsells sub tab
      cy.click_link_button(clientmodules.billingtab[2].upsellstablink)
        .wait(1000)
    
      //Click the Create Upsell button
      cy.click_link_button(clientmodules.billingtab[2].createupsellbutton)
        .wait(1000)

      //verify Create upsell modal popup open
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].modal)
      .should('exist')

      //verify in the Upsell Item drop down list the newly created upsell item should be included
      //By selecting the newly created upsell item
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].upsellitemdropdownmenu)
        .select('AItemCode012345')
        .should('have.value', 'AItemCode012345')
        .wait(2000)

      //this will verify that when the newly added upsell item was selected, it did appeared on top
      cy.get('div.grid > div:nth-child(1) > select option:selected').should('have.text', `0000Aldwin Item Name ${utilfunc.getFormattedDate()}`);

      //verify the Unit Price input field should reflect
      cy.get("div > input[name='details.price']")
        .should('exist')
        .and('have.value', '250')

      //I will also verify the description should also appear in the create upsell modal as I select this newly created upsell 
      cy.get("div > textarea[name='details.description']")
        .should('exist')
        .and('have.value', 'This item description is only for testing purposes only.')
  })
  it('Testcase ID: BUI0002 - Add New Upsell Item but the Invoice Item Code is existing on another existing Upsell item. ', ()=>{

    let GETInvoiceItemCode;
    let invoiceItemcode;

    //login using admin role
    cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
    
    // Click the Billing Module
    cy.click_link_button(clientmodulesnavlink.billingnavlink)
      .wait(2000)

    //Click the Upsell Items link text folder
    cy.click_link_button(billingmodule.UpsellItems[0].UpsellItemslinktextfolder)
      .wait(2000)
    
    //I will get the Invoice Item Code of the existing upsell item in row 1 and store in a local variable so that I may use ahead
    GETInvoiceItemCode = new Promise((resolve)=>{
      cy.get('table > tbody > tr:first-child > td:nth-child(2)')
        .then((txt)=>{
          invoiceItemcode = txt.text().trim();
          cy.log(invoiceItemcode)
          resolve();
        })
    })

    //Click the Add button
    cy.click_link_button(billingmodule.UpsellItems[0].addbutton)
      .wait(2000)

    //verify Create Upsell Items modal popup
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
      .should('exist')

    //Enter Upsell Item Name
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemNameinputandlabel)
      .find('input')
      .type(`ItdoesntMatterThisName`)
      .wait(1000)
      .should('have.value', 'ItdoesntMatterThisName')

    //Enter Invoice Item Code
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemCodeinputandlabel)
      .should('exist')
      .then(()=>{
        GETInvoiceItemCode.then(()=>{
          cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemCodeinputandlabel)
            .find('input')
            .type(invoiceItemcode)
            .wait(1000)
            .should('have.value', invoiceItemcode)
        })
      })
    
    //Enter Item Description
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ItemDescriptionfieldandlabel)
      .find('textarea')
      .type('This item description is only for testing purposes only.')
      .wait(1000)
      .should('have.value', 'This item description is only for testing purposes only.')

    //Enter One Time Fee
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].OneTimeFeeinputandlabel)
      .find('input')
      .type('250')
      .wait(1000)
      .should('have.value', '250')

    //Click the Save button
    cy.click_link_button(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
      .wait(3000)

    //verify alert-error text message
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Failed to add invoice item')
    cy.getMessagepopup(alertmessageslocators.updatemessage, 'Adoon already exists')

    //verify that the create upsell item modal should remain open or popup
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
      .should('exist')
  })
  it('Testcase ID: BUI0003 - Edit an existing Addons/Upsell Items', ()=>{

    let GETInvoiceItemCode;
    let invoiceItemcode;

    //login using admin role
    cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
    
    // Click the Billing Module
    cy.click_link_button(clientmodulesnavlink.billingnavlink)
      .wait(2000)

    //Click the Upsell Items link text folder
    cy.click_link_button(billingmodule.UpsellItems[0].UpsellItemslinktextfolder)
      .wait(2000)
    
    //Select the first row in the Addon/Upsell Items table to edit by clicking its edit button in the action column
    cy.click_link_button('table > tbody > tr:first-child > td:nth-child(6) > div > button:nth-child(1)')
      .wait(2000)

    //verify modal popup
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].modal)
      .should('exist')

    //Now I will have to verify first the Invoice Item Code input field as it should not be editable
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemCodeinputandlabel)
      .should('exist')
      .find('input')
      .and('have.attr', 'disabled')
    
    //Then I will get the Invoice Item Code and store in a local variable so that this test cases may run alone even without running first BUI0001 - the ahead test cases
    GETInvoiceItemCode = new Promise((resolve)=>{
      cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemCodeinputandlabel)
        .find('input')
        .invoke('val')
        .then((val1)=>{
          invoiceItemcode = val1;
          cy.log(invoiceItemcode)
          resolve();
        })
    })

    //I will now edit the Invoice Item Name
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].InvoiceItemNameinputandlabel)
      .find('input')
      .clear()
      .type('0000Admin01')
      .wait(1000)
      .should('have.value', '0000Admin01')

    //Edit the Item Description
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].ItemDescriptionfieldandlabel)
      .find('textarea')
      .clear()
      .type('My intention is to edit this description only')
      .wait(1000)
      .should('have.value', 'My intention is to edit this description only')
    //Edit the One Time Fee
    cy.get(billingmodule.UpsellItems[0].createupsellitemsmodal[0].OneTimeFeeinputandlabel)
      .find('input')
      .clear()
      .type('150')
      .wait(1000)
      .should('have.value', '150')
    
    //Click the Save button
    cy.click_link_button(billingmodule.UpsellItems[0].createupsellitemsmodal[0].savebutton)
    .wait(3000)

    //verify alert-error text message 
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Invoice item edited')
    cy.getMessagepopup(alertmessageslocators.updatemessage, 'Addon updated')

    ///// ADDONS/UPSELL ITEMS TABLE LIST ASSERTIONS STARTS HERE //////
    cy.get('table > tbody > tr:first-child').within(()=>{
      //assert column 1 > Name
      cy.get(' > td:nth-child(1)')
        .should('exist')
        .and('have.text', '0000Admin01')
        .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
      //assert column 3 > Description
      cy.get(' > td:nth-child(3)')
        .should('exist')
        .and('have.text', 'My intention is to edit this description only')
        .and('have.css', 'color', 'rgb(102, 102, 102)') //text color
      //assert column 4 > Price
      cy.get(' > td:nth-child(4) > span')
        .should('exist')
        .and('have.text', '$150')
        .find('span').should('have.css', 'color', 'rgb(156, 163, 175)') //the dollar symbol color
    })
    ///// ADDONS/UPSELL ITEMS TABLE LIST ASSERTIONS ENDS HERE //////

    //Then here I will verify in the Client > Billing > Upsell > Create Upsell modal > Upsell Item list drop-down that it reflects
      //Click the Client Navigation button
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(3000)

      //Select client test -> AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(2000)

      //click the billing tab
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)
      
      // Click the Upsells sub tab
      cy.click_link_button(clientmodules.billingtab[2].upsellstablink)
        .wait(1000)
    
      //Click the Create Upsell button
      cy.click_link_button(clientmodules.billingtab[2].createupsellbutton)
        .wait(1000)

      //verify Create upsell modal popup open
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].modal)
      .should('exist')

      //verify in the Upsell Item drop down list the newly created upsell item should be included
      //By selecting the newly created upsell item
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].upsellitemdropdownmenu).then(()=>{
        GETInvoiceItemCode.then(()=>{
          cy.get(clientmodules.billingtab[2].createupsellmodal[0].upsellitemdropdownmenu)
            .select(invoiceItemcode)
            .should('have.value', invoiceItemcode)
            .wait(2000)
        })
      })
        
      //this will verify that when the newly added upsell item was selected, it did appeared on top
      cy.get('div.grid > div:nth-child(1) > select option:selected').should('have.text', '0000Admin01');

      //verify the Unit Price input field should reflect the changes made
      cy.get("div > input[name='details.price']")
        .should('exist')
        .and('have.value', '150')

      //I will also verify the description should also appear in the create upsell modal as I select this newly created upsell 
      cy.get("div > textarea[name='details.description']")
        .should('exist')
        .and('have.value', 'My intention is to edit this description only')
        
  })
  it('Testcase ID: BUI0004 - Verify user can Delete an existing Addons/Upsell Items category', ()=>{

    let GETUpsellItemName;
    let upsellitemName;

    //login using admin role
    cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)
    
    // Click the Billing Module
    cy.click_link_button(clientmodulesnavlink.billingnavlink)
      .wait(2000)

    //Click the Upsell Items link text folder
    cy.click_link_button(billingmodule.UpsellItems[0].UpsellItemslinktextfolder)
      .wait(2000)

    //I will get firs the name of the upsell item that I wanted to delete
    GETUpsellItemName = new Promise((resolve)=>{
      cy.get('table > tbody > tr:first-child > td:nth-child(1)')
        .should('exist')
        .then((txt)=>{
          upsellitemName = txt.text().trim();
          cy.log(`The Upsell Item that I want to delete is ${upsellitemName}`)
        })
    })
   
    //Select the first row in the Addon/Upsell Items table to delete by clicking its delete button in the action column
    cy.click_link_button('table > tbody > tr:first-child > td:nth-child(6) > div > button:nth-child(2)')
      .wait(2000)

    //verify confirmation dialog popup
    cy.get(billingmodule.UpsellItems[0].ConfirmDeletemodal[0].modal)
      .should('exist')

    //verify the Confirmation Dialog modal title
    cy.get(billingmodule.UpsellItems[0].ConfirmDeletemodal[0].modaltitle)
      .should('exist')
      .and('have.text', 'Confirm Delete Item')
      .and('have.css', 'font-weight', '700')

    //verify Are you sure you want to delete this addon/upsell item? 
    cy.get(billingmodule.UpsellItems[0].ConfirmDeletemodal[0].areyousureyouwanttodeletethisupsell)
      .should('exist')
      .and('have.text', 'Are you sure you want to delete this addon/upsell item? ')
      .and('have.css', 'color', 'rgb(107, 114, 128)') // text color

    //verify No button
    cy.get(billingmodule.UpsellItems[0].ConfirmDeletemodal[0].nobutton)
      .should('exist')
      .and('not.be.disabled')
      .and('have.text', 'No')
      .and('have.css', 'font-weight', '700')  // font bold
      .and('have.css', 'color', 'rgb(148, 148, 148)') // text color

    //verify Yes button
    cy.get(billingmodule.UpsellItems[0].ConfirmDeletemodal[0].yesbutton)
      .should('exist')
      .and('not.be.disabled')
      .and('have.text', 'Yes')
      .and('have.css', 'font-weight', '700')  // font bold
      .and('have.css', 'color', 'rgb(255, 255, 255)') // text color
      .and('have.css', 'background-color', 'rgb(5, 150, 105)') // background color that form like a capsule
      .and('have.css', 'border-radius', '40px') //the curve edge of the background color

    //Click the Yes button
    cy.click_link_button(billingmodule.UpsellItems[0].ConfirmDeletemodal[0].yesbutton)
      .wait(3000)

    //verify alert-error text message 
    cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Invoice item deleted')
    cy.getMessagepopup(alertmessageslocators.updatemessage, 'Addon deleted')
    
    //this part is to verify in the table that it is not anymore included
    // If the loop completes without finding the text, the test will pass
    cy.get('table > tbody > tr > td:first-child').each(($td) => {
      const text = $td.text(); // Get the text content of each first column cell
      GETUpsellItemName.then(()=>{
        // Check if the text matches the expected value
        if (text.includes(upsellitemName)) {
          // If found, you can fail the test
          throw new Error(`The deleted Upsell Item isFound: It should not be present in the table. -> ${upsellitemName}`);
          // Or using chai assertions:
          // expect(true).to.equal(false); // Assertion to fail the test
        }
      })
    });
  })
    // **** BILLING CREATE UPSELL ITEMS ENDS HERE ***
    // **** NOT INCLUDED IN TEST STARTS HERE ***
  it.skip('TRIALS 1 - NOT INCLUDED IN TEST', ()=>{

      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //verify there is a Billing Navigation module button
      cy.get(clientmodulesnavlink.billingnavlink)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //font color
        .and('have.css', 'font-weight', '400') //font bold
        .and('have.text', 'Billing')
  
      //verify as well there is an icon in the Billing
      cy.get(clientmodulesnavlink.billingnavlinkicon)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(255, 255, 255)') //font color
        .and('have.css', 'font-weight', '400') //font bold
      
      //Click the Billing Nav module
      cy.click_link_button(clientmodulesnavlink.billingnavlink)
        .wait(1000)

      //verify url destination page
      cy.url().should('contain', '/invoices?page=1&status=Pending&sizePerPage')

      //verify that it there is this title label "Billing" on top of the link text folders
      cy.get(clientmodules.titlenavmodules)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(102, 102, 102)') //font color
        .and('have.css', 'font-weight', '700') //font bold
        .and('not.be.disabled')
        .and('have.text', 'Billing')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      
      //when a user access the Billing for the first time, it automatically accessed the Invoice sub page
      //verify that the invoice sub link text changes color signifying that it is currently accessed
      cy.get(billingmodule.Invoices[0].invoiceslinktextfolder) // Invoice link text
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(239, 68, 68)') //font color
        .and('have.css', 'font-weight', '500') //font bold
        .and('not.be.disabled')
        .and('have.text', 'Invoices')
      cy.get(billingmodule.Invoices[0].invoiceslinktextfoldericon) //logo / icon next to Invoice link text
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(239, 68, 68)') // color

      //verify Invoice sub page Main title
      cy.get(billingmodule.Invoices[0].invoicemaintitlepage)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.text', 'Invoices')

      //verify that there is also Items link text
      cy.get(billingmodule.Items[0].itemslinktextfolder) //Items Link text 
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(156, 163, 175)') //default font color
        .and('not.be.disabled')
        .and('have.text', 'Items')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      cy.get(billingmodule.Items[0].itemslinktextfoldericon) //logo / icon next to Items link text
        .should('have.css', 'color', 'rgb(156, 163, 175)') // default color

      //I now select the Items link text folder
      cy.click_link_button(billingmodule.Items[0].itemslinktextfolder)
        .wait(1000)

      //verify that it goes to correct page destination
      cy.url().should('contain', '/items?page=1&sizePerPage')
      
      //verify that the Items link text folder and its icon changes color when visited by user
      cy.get(billingmodule.Items[0].itemslinktextfolder) //Items Link text 
        .should('have.css', 'color', 'rgb(239, 68, 68)') //changed font color
      cy.get(billingmodule.Items[0].itemslinktextfoldericon) //logo / icon next to Items link text
        .should('have.css', 'color', 'rgb(239, 68, 68)') // change color

      //verify also that the Invoice link text and its logo goes back to its default color
      cy.get(billingmodule.Invoices[0].invoiceslinktextfolder) // Invoice link text
        .should('have.css', 'color', 'rgb(156, 163, 175)') //deault font color
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      cy.get(billingmodule.Invoices[0].invoiceslinktextfoldericon) //logo / icon next to Invoice link text
        .should('have.css', 'color', 'rgb(156, 163, 175)') // default color

      //verify main title of the sub page Upsell Items
      cy.get(billingmodule.Items[0].upsellitemmaintitlepage)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.text', 'Upsell Items')

      //verify Add button
      cy.get(billingmodule.Items[0].addbutton)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'color', 'rgb(75, 85, 99)') //font color
        .and('have.css', 'border-color', 'rgb(209, 213, 219)') //border color
        .and('have.css', 'border-width', '1px') //border width
        .and('have.css', 'width', '55.28125px') //width
        .and('have.css', 'height', '26px') //height
        .and('not.be.disabled')
        .and('have.text', ' Add')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //click the Add button
      cy.click_link_button(billingmodule.Items[0].addbutton)
        .wait(1000)

      //verify the Create Upsell Items modal popup
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].modal)
        .should('be.visible')
        .and('exist')

      //////////////// CREATE UPSELL ITEMS MODAL ASSERTIONS ELEMENTS STARTS HERE //////////////////
      //verify Create Upsell Items modal title 
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].modaltitle)
        .should('be.visible')
        .and('exist')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.text', 'Create Upsell Items')

      //verify Category drop down menu label
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].categorydropdownmenulabel)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Category')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //verify Select Category drop down menu
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].categorydropdownmenu)
        .should('be.visible')
        .and('exist')
        .and('not.be.disabled')
      //and the expected options
      const selectCategoryOptions = [
          'Select Category',
          'Account Management',
          'Walmart',
          'SMTG',
          'HeyPixel',
          'Mesmeric',
          'Magic Ads',
          'Mashpop',
          'Typelab',
          'Unloop'
      ];
      cy.get('form > div.grid >div:nth-child(1) > select[name="category"] > option').each(($option, index) => {
          cy.wrap($option).should('have.text', selectCategoryOptions[index]) //verify names based on the expected options
          .should('exist')
          .and('not.be.disabled')
          cy.log(selectCategoryOptions[index]) 
      });

      //verify Invoice Item Name input field label
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemnameinputfieldlabel)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Invoice Item Name')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //verify Invoice Item Name input field
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemnameinputfield)
        .should('be.visible')
        .and('exist')
        .and('not.be.disabled')
        .and('have.value', '')
        .and('have.attr', 'placeholder', 'Name')

      //verify Invoice Item input field Code
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemcodeinputfieldlabel)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Invoice Item Code')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })
      
      //verify Invoice Item Code input field
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemcodeinputfield)
        .should('be.visible')
        .and('exist')
        .and('not.be.disabled')
        .and('have.value', '')
        .and('have.attr', 'placeholder', 'Code')

      //verify Description textarea field label
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].descriptiontextarefieldlabel)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Description')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //verify Description textarea field
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].descriptiontextarefield)
        .should('be.visible')
        .and('exist')
        .and('not.be.disabled')
        .and('have.value', '')
        .and('have.attr', 'placeholder', 'Description')

      //verify One Time Fee label
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].onetimefeeradiobuttonlabel)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'One Time Fee')

      //by defauyklt the One Time Fee is selected and to know it is, the color is red tick radio button
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].onetimefeeradiobutton)
        .should('be.visible')
        .and('exist')
        .and('be.checked') //by default it is checked
        .and('have.css', 'color', 'rgb(220, 38, 38)') // radio button color

      //verify One Time Fee Price input field
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].onetimefeepriceinputfield)
        .should('be.visible')
        .and('exist')
        .and('not.be.disabled')
        .and('have.attr', 'placeholder', '$ Price')

      //verify Recurring Fee label
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].recurringfeeradiobuttonlabel)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Recurring Fee')

      //verify Recurring Fee radio button and should not be checked
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].recurringfeeradiobutton)
        .should('be.visible')
        .and('exist')
        .and('not.be.checked')

      //verify Recurring Fee Price input field
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].recurringfeepriceinputfield)
        .should('be.visible')
        .and('exist')
        .and('be.disabled') //disabled by default
        .and('have.attr', 'placeholder', '$ Price')

      //verify cancel button
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].cancelbutton)
        .should('be.visible')
        .and('exist')
        .and('not.be.disabled')
        .and('have.text', 'Cancel')

      //verify save button
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].savebutton)
      .should('be.visible')
      .and('exist')
      .and('not.be.disabled')
      .and('have.text', 'Save')
      .and('have.css', 'color', 'rgb(255, 255, 255)') //font color
      .and('have.css', 'background-color', 'rgb(185, 28, 28)') //colo of the capsule like button
      .and('have.css', 'font-weight', '700') // font bold
      .and('have.css', 'border-radius', '16px') //the curve edges of tbe button
      .and('have.css', 'width', '82.421875px')
      .and('have.css', 'height', '34px')
      //////////////// CREATE UPSELL ITEMS MODAL ASSERTIONS ELEMENTS ENDS HERE //////////////////
      ///// REQUIRED FIELDS ASSERTIONS STARTS HERE ////////////
      //----------------------------------------------//
      //without entering any data on any of the fields, click the save button
      //it is expected that the modal remains open
      // error text appeared below those fields that are required to be filled
      cy.click_link_button(billingmodule.Items[0].createupsellitemsmodal[0].savebutton)
        .wait(1000)
      
      //verify the Create Upsell Items modal remains open
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].modal)
        .should('be.visible')
        .and('exist')

      //verify 'Required' error text below the ff:
      // Category drop down menu, Invoice Item Name input field, Invoice Item Code input field, One Time Fee Price input field
      cy.get('form > div.grid >div > div').each(($errotext) => {
          cy.wrap($errotext)
            .should('have.text', 'Required') //verify names based on the expected options
            .should('exist')
            .and('have.css', 'color', 'rgb(185, 28, 28)') // font color
      });
      //----------------------------------------------//
      ///// REQUIRED FIELDS ASSERTIONS ENDS HERE ////////////
      //////// FILL UP THE CREATE UPSELL ITEMS MODAL STARTS HERE //////////////////
      //Select Category = Account Management
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].categorydropdownmenu).select('account').should('have.value','account')
        .wait(1000)

      //Enter Invoice Item Name
      cy.type_enter_data(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemnameinputfield, 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween())
   
      //Enter Invoice Item Code
      cy.type_enter_data(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemcodeinputfield , 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween())
   
      //Enter Description
      cy.type_enter_data(billingmodule.Items[0].createupsellitemsmodal[0].descriptiontextarefield, 'This is a test description of a test upsell item I created on this test script.')

      //Enter One Time Fee Price
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].onetimefeepriceinputfield)
        .clear().type('555')

      //Click the Save button
      cy.click_link_button(billingmodule.Items[0].createupsellitemsmodal[0].savebutton)
        .wait(3000)  
      //////// FILL UP THE CREATE UPSELL ITEMS MODAL  ASSERTIONS ELEMENTS ENDS HERE //////////////////
      //verify success notification message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Upsell Item Saved')
   
      //verify at the Billing > Items > Account Management Tab the newly created item

      // AT THE TIME I WAS MAKING THIS, THE DEFAULT SET IN THE PAGINATION IS 50 AS NORMALLY IT SHOULD BE 10 PER PAGE
      // I DISREGARD FOR THE MEANTIME
      //NOW I AM GETTING THE LAST ROW IN THE TABLE
      cy.get('div > table > tbody > tr:LAST-child').within(()=>{
        //assert Row 1 Col 1 = Invoice Item Name
        cy.get('td:nth-child(1) ')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween())
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 2 = Description
        cy.get('td:nth-child(2) > div')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'This is a test description of a test upsell item I created on this test script.')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 3 = Invoice Item Code [ Code ]
        cy.get('td:nth-child(3)')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween())
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 4 = Status
        cy.get('td:nth-child(4)')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'active')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 5 = Price
        cy.get('td:nth-child(5) > span')
          .should('be.visible')
          .and('exist')
          .and('have.text', '$555.00')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Action Column buttons such as Edit and Delete button
        cy.get('td:nth-child(6)') //action column
          .should('be.visible')
          .and('exist')
          .then(()=>{
            cy.get('td:nth-child(6) > span > button:nth-child(1)') // action column > edit button
              .should('be.visible')
              .and('exist')
              .then(($el) => {
                const computedStyle = getComputedStyle($el[0]);
                const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
                expect(customPropertyValue).to.equal('1')
              })
            cy.get('td:nth-child(6) > span > button:nth-child(2)') // action column > delete button
              .should('be.visible')
              .and('exist')
              .then(($el) => {
                const computedStyle = getComputedStyle($el[0]);
                const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
                expect(customPropertyValue).to.equal('1')
              })
          })
      })
      //I will forcebly reload the page just to be sure that it will reflect in the Create Upsell Request Modal > Upsell Items drop down menu
      cy.reload()
      cy.wait(8000)
      //verify in the Client > Billing > Upsells > Create Upsell modal > Upsell item drop down menu that it appears in there the newly added upsell item 
      //Click the Client nav module
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(1000)

      //click the test client = AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(1000)

      //Click the Billing
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

      //Click the Upsells tab
      cy.click_link_button(clientmodules.billingtab[2].upsellstablink)
        .wait(1000)

      //Click the Create Upsell button
      cy.click_link_button(clientmodules.billingtab[2].createupsellbutton)
        .wait(2000)

      //Create Upsell Request modal popup
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].modal)
        .should('be.visible')
        .and('exist')

      //verify in the Create Upsell modal > Add items drop down menu that the newly added upsell item is visible
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].upsellitemsdropdownmenu)
        .select('AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween())
        .should('have.value', 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween())      
  })
  it.skip('TRIALS 2 - NOT INCLUDED IN TEST', ()=>{


      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //Click the Billing Nav module
      cy.click_link_button(clientmodulesnavlink.billingnavlink)
        .wait(1000)

      //I now select the Items link text folder
      cy.click_link_button(billingmodule.Items[0].itemslinktextfolder)
        .wait(1000)

      //since it was in the last row so that is what i am going to get
      //GET the Action column > Edit Button
      cy.get('div > table > tbody > tr:LAST-child').should('exist').then(()=>{
        //And on this Action column there is edit button, click on it
        cy.click_link_button('div > table > tbody > tr:LAST-child > td:nth-child(6) > span > button:nth-child(1)')
          .wait(1000)
      })

      //verify edit upsell items modal popup
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].modal)
        .should('be.visible')
        .and('exist')
        
      //verify that the Invoice Item Code input field is not editable
      cy.get(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemcodeinputfield)
        .should('be.visible')
        .and('exist')
        .and('be.disabled') //not editable

      ///////// EDIT THE FIELDS, INVOICE ITEM NAME, INVOICE ITEM CODE, DESCRIPTION, AND PRICE STARES HERE /////////
      //Enter Invoice Item Name
      cy.type_enter_data(billingmodule.Items[0].createupsellitemsmodal[0].invoiceitemnameinputfield, 'AccountItemEditted'+utilfunc.getFormattedDateNoSpaceInBetween())
     
      //Enter Description
      cy.type_enter_data(billingmodule.Items[0].createupsellitemsmodal[0].descriptiontextarefield,'I just edit this description for testing purposes only.')

      //Enter One Time Fee Price
      cy.type_enter_data(billingmodule.Items[0].createupsellitemsmodal[0].onetimefeepriceinputfield, '700')
  
      //Click the Save button
      cy.click_link_button(billingmodule.Items[0].createupsellitemsmodal[0].savebutton)
        .wait(3000)  
      ///////// EDIT THE FIELDS, INVOICE ITEM NAME, INVOICE ITEM CODE, DESCRIPTION, AND PRICE ENDS HERE /////////
      //verify success notification message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'Upsell Item Updated')

      //verify again the editted upsell item row per column if changes applied
      cy.get('div > table > tbody > tr:LAST-child').within(()=>{
        //assert Row 1 Col 1 = Invoice Item Name
        cy.get('td:nth-child(1) ')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'AccountItemEditted'+utilfunc.getFormattedDateNoSpaceInBetween())
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 2 = Description
        cy.get('td:nth-child(2) > div')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'I just edit this description for testing purposes only.')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 4 = Status
        cy.get('td:nth-child(4)')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'active')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Row 1 Col 5 = Price
        cy.get('td:nth-child(5) > span')
          .should('be.visible')
          .and('exist')
          .and('have.text', '$700.00')
          .then(($el) => {
            const computedStyle = getComputedStyle($el[0]);
            const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
            expect(customPropertyValue).to.equal('1')
          })
        //assert Action Column buttons such as Edit and Delete button
        cy.get('td:nth-child(6)') //action column
          .should('be.visible')
          .and('exist')
          .then(()=>{
            cy.get('td:nth-child(6) > span > button:nth-child(1)') // action column > edit button
              .should('be.visible')
              .and('exist')
              .then(($el) => {
                const computedStyle = getComputedStyle($el[0]);
                const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
                expect(customPropertyValue).to.equal('1')
              })
            cy.get('td:nth-child(6) > span > button:nth-child(2)') // action column > delete button
              .should('be.visible')
              .and('exist')
              .then(($el) => {
                const computedStyle = getComputedStyle($el[0]);
                const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
                expect(customPropertyValue).to.equal('1')
              })
          })
      })
      //I will forcebly reload the page just to be sure that it will reflect in the Create Upsell Request Modal > Upsell Items drop down menu
      cy.reload()
      cy.wait(8000)
      //verify in the Client > Billing > Upsells > Create Upsell modal > Upsell item drop down menu that it appears in there the newly added upsell item 
      //Click the Client nav module
      cy.click_link_button(clientmodulesnavlink.clientsnavlink)
        .wait(1000)

      //click the test client = AAAROO TEST
      cy.click_link_button(clientmodules.testclient)
        .wait(1000)

      //Click the Billing
      cy.click_link_button(clientmodules.billingtab[0].billingtablink)
        .wait(1000)

      //Click the Upsells tab
      cy.click_link_button(clientmodules.billingtab[2].upsellstablink)
        .wait(1000)

      //Click the Create Upsell button
      cy.click_link_button(clientmodules.billingtab[2].createupsellbutton)
        .wait(2000)

      //Create Upsell Request modal popup
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].modal)
        .should('be.visible')
        .and('exist')

      //verify in the Create Upsell modal > Add items drop down menu that the edited upsell item is visible
      cy.get(clientmodules.billingtab[2].createupsellmodal[0].upsellitemsdropdownmenu)
        .select('AccountItemEditted'+utilfunc.getFormattedDateNoSpaceInBetween()) // the edited version of the invoice item name
        .should('have.value', 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween()) //the value remains the same because the user cannot edit an existing invoice item code    
  })
  it.skip('TRIALS 3 - NOT INCLUDED IN TEST', ()=>{

      let currentTotalRows;

      //login using admin role account
      cy.userloginaccount(loginmodules.loginform[0].emailaddressinputfield, loginmodules.loginform[0].passwordinputfield, loginmodules.loginform[0].signinbutton, useraccountdata.usernameAdmin, useraccountdata.adminpassword)

      //Click the Billing Nav module
      cy.click_link_button(clientmodulesnavlink.billingnavlink)
        .wait(1000)

      //I now select the Items link text folder
      cy.click_link_button(billingmodule.Items[0].itemslinktextfolder)
        .wait(1000)

      // I will count first the total count of rows
      // Locate the table and count all the rows
      cy.get('div > table > tbody > tr').should('have.length.gt', 0).then((rows) => {
        // Store the initial row count in a variable
        currentTotalRows = rows.length;
        // Log the currentTotalRows value
        cy.log(`The Initial Total Rows: ${currentTotalRows}`);
      });

      //since it was in the last row so that is what i am going to get
      //GET the Action column > Delete button
      cy.get('div > table > tbody > tr:LAST-child').should('exist').then(()=>{
        //And on this Action column there is edit button, click on it
        cy.click_link_button('div > table > tbody > tr:LAST-child > td:nth-child(6) > span > button:nth-child(2)')
          .wait(1000)
      })

      //verify Delete Item confirmation dialog modal popup
      cy.get(billingmodule.Items[0].deleteitemmodal[0].modal)
        .should('be.visible')
        .and('exist')

      ////////// DELETE ITEM CONFIRMATION DIALOG MODAL ASSERTIONS ELEMENTS STARTS HERE ///////////////
      //verify modal title
      cy.get(billingmodule.Items[0].deleteitemmodal[0].modaltitle)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Delete Item')
        .and('have.css', 'font-weight', '700') //font bold

      //verify Are you sure you want to delete this upsell ?
      cy.get(billingmodule.Items[0].deleteitemmodal[0].areyousureyouwanttodeletethisupsell)
        .should('be.visible')
        .and('exist')
        .and('contain', 'Are you sure you want to delete this upsell ?')
        .then(($el) => {
          const computedStyle = getComputedStyle($el[0]);
          const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
          expect(customPropertyValue).to.equal('1')
        })

      //verify yes button
      cy.get(billingmodule.Items[0].deleteitemmodal[0].yesbutton)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'Yes')
        .and('not.be.disabled')
        .and('have.css', 'font-weight', '700') //font bold
        .and('have.css', 'color', 'rgb(255, 255, 255)') //font color
        .and('have.css', 'background-color', 'rgb(5, 150, 105)') //the capsule-like button color
        .and('have.css', 'border-radius', '16px') // the curve edge of the capsule-like button
        .and('have.css', 'width', '74.234375px')
        .and('have.css', 'height', '30px')

      //verify no button
      cy.get(billingmodule.Items[0].deleteitemmodal[0].nobutton)
        .should('be.visible')
        .and('exist')
        .and('have.text', 'No')
        .and('not.be.disabled')
        .and('have.css', 'font-weight', '700') //font bold
      ////////// DELETE ITEM CONFIRMATION DIALOG MODAL ASSERTIONS ELEMENTS ENDS HERE ///////////////
      //click the yes button
      cy.click_link_button(billingmodule.Items[0].deleteitemmodal[0].yesbutton)
        .wait(3000)
      
      //verify alert-success message popup
      cy.getMessagepopup(alertmessageslocators.updatesuccessmessagepopup, 'success')
      cy.getMessagepopup(alertmessageslocators.updatemessage, 'Iten Delete Successfuly')

      //verify in the Account Management tab table list that the deleted item is no longer exist
      // I will count AGAIN the total count of rows
      // Locate the table and count all the rows
      cy.get('div > table > tbody > tr').should('have.length.gt', 0).then((rows) => {
        // Store the recounting of rows in a variable
        let recountingTotalRows = rows.length;
        // compare it to previous total count of rows
        cy.log(`The Recounting of Total Rows is: ${recountingTotalRows}`);
        if(recountingTotalRows === 1){
          //there is always 1 row but that does not mean that row has columns
          //it could be 1 row 1 col and that column is = No results found :(
          //or it could be also 1 upsell item left
          cy.get('div > table > tbody > tr > td').should('exist').then((cols)=>{
            let countcols = cols.length;
            if(countcols === 1){
              cy.get('div > table > tbody > tr > td').should('have.text', 'No results found :(') 
              expect(recountingTotalRows).to.equal(currentTotalRows);
            } else {
              //it means sure it currently has 1 row but more than 1 columns then that is a single upsell item left
              let previoustotalcount = currentTotalRows - 1;
              expect(recountingTotalRows).to.equal(previoustotalcount) 
            }
          })
        } else {
          //there are more than one rows
          let previoustotalcount = currentTotalRows - 1;
          expect(recountingTotalRows).to.equal(previoustotalcount) 
        }
      });

        //I will forcebly reload the page just to be sure that it will reflect in the Create Upsell Request Modal > Upsell Items drop down menu
        cy.reload()
        cy.wait(8000)
        //verify in the Client > Billing > Upsells > Create Upsell modal > Upsell item drop down menu that it appears in there the newly added upsell item 
        //Click the Client nav module
        cy.click_link_button(clientmodulesnavlink.clientsnavlink)
          .wait(1000)

        //click the test client = AAAROO TEST
        cy.click_link_button(clientmodules.testclient)
          .wait(1000)

        //Click the Billing
        cy.click_link_button(clientmodules.billingtab[0].billingtablink)
          .wait(1000)

        //Click the Upsells tab
        cy.click_link_button(clientmodules.billingtab[2].upsellstablink)
          .wait(1000)

        //Click the Create Upsell button
        cy.click_link_button(clientmodules.billingtab[2].createupsellbutton)
          .wait(2000)

        //Create Upsell Request modal popup
        cy.get(clientmodules.billingtab[2].createupsellmodal[0].modal)
          .should('be.visible')
          .and('exist')

        //verify in the Create Upsell modal > Add items drop down menu that the deleted upsell item is not visible
        cy.get(clientmodules.billingtab[2].createupsellmodal[0].upsellitemsdropdownmenu)
          .should('not.have.value', 'AccountItem'+utilfunc.getFormattedDateNoSpaceInBetween()) //the value remains the same because th
  })
  // **** NOT INCLUDED IN TEST ENDS HERE ***
})