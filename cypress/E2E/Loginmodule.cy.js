/// <reference types="cypress" />

let loginmoduledata;
let useraccountdata;
let alertmessageslocators;
let clientmodules;
let BSmodulesnavlink;

before('This would call files that are at the fixtures', ()=>{

  //inititating LoginModuleData.json
  cy.fixture('LoginModuleData').then((data)=>{
    loginmoduledata = data;
  })

  //initiating user accounts data
  cy.fixture('useraccounts').then((data)=>{
    useraccountdata=data;
  })

  //initiating alert messages
  cy.fixture('alertmessages').then((data)=>{
    alertmessageslocators=data;
  })

  //initiating the clientmodulelocators
  cy.fixture('clientmodulelocators').then((data)=>{
    clientmodules=data;
  })

  //initiating the BSnavlinksmodules
  cy.fixture('BSnavlinksmodules').then((data)=>{
    BSmodulesnavlink = data;
  })

})

beforeEach('Launch BS Login Page', ()=>{
  cy.visit(loginmoduledata.testData[0].testURL1)
  .wait(3000)

  //change the window size of the browser
  cy.viewport(1600, 1100)

  //assert url - when launched sucessfully
  cy.url().should('contain','/sign-in')
})

//The test cases are based on the Jira Confluence 
describe('Login Module Test Suite', () => {

  it('Testcase ID: L0001 - Verify there is a page title and correct', () => {
    cy.title().should('eq','Agency - BetterSeller')  
  })

  it('Testcase ID: L0002 - Verify there is a BetterSeller Logo', () => {
    cy.get(loginmoduledata.cssSelectors[0].bettersellerLogo)
      .wait(1000)
      .should('exist')
      .and('have.css', 'width', '48px')   //expected rendered size on the web
      .and('have.css', 'height', '48px')  //expected rendered size on the web
  })

  it('Testcase ID: L0003 - Verify there login form title', () => {
    cy.get(loginmoduledata.cssSelectors[0].bettersellerHeaderTitle)
      .wait(1000)
      .should('exist')
      .and('have.css', 'font-weight', '800') // font bold
      .and('have.text','Agency Dashboard')
  })

  it('Testcase ID: L0004 - Verify there is an email address input field.', () => {
    
    //verify Email Address input field label is visible and correct
    cy.get(loginmoduledata.cssSelectors[0].EmailAddressLabel)
      .wait(1000)
      .should('exist')
      .and('have.text','Email address')
      .then(($el) => {
        const computedStyle = getComputedStyle($el[0]);
        const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
        expect(customPropertyValue).to.equal('1')
      })

      //verify Email Address input field is visible, empty, and enabled
      cy.get(loginmoduledata.cssSelectors[0].emailaddressInputfield)
        .wait(1000)
        .should('exist')
        .and('have.value','') //should empty by default
        .and('be.enabled')
  })

  it('Testcase ID: L0005 - Verify there is a password address input field.', () => {
    
    //verify password input field label is visible and correct
    cy.get(loginmoduledata.cssSelectors[0].PasswordLabel)
      .wait(1000)
      .should('exist')
      .and('have.text','Password')
      .then(($el) => {
        const computedStyle = getComputedStyle($el[0]);
        const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
        expect(customPropertyValue).to.equal('1')
      })

      //verify password input field is visible, empty, and enabled
      cy.get(loginmoduledata.cssSelectors[0].passwordInputfield)
        .wait(1000)
        .should('exist')
        .and('have.value', '') //should be emptyby default
        .and('be.enabled')
  })

  it('Testcase ID: L0006 - Verify there is a Remember me tick box and label', () => {
    
    //verify remember me label is visible and correct
    cy.get(loginmoduledata.cssSelectors[0].remembermeLabel)
      .wait(2000)
      .should('exist')
      .and('have.text', 'Remember me')
      .then(($el) => {
        const computedStyle = getComputedStyle($el[0]);
        const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
        expect(customPropertyValue).to.equal('1')
    })


    //verify remember me tick box is visible, not yet checked, and enabled
    cy.get(loginmoduledata.cssSelectors[0].remembermeCheckbox)
      .wait(1000)
      .should('exist')
      .should('not.be.checked')
      .should('be.enabled')
  })

  it('Testcase ID: L0007 - Verify there is a link text called Forgot your password?', () => {

    //verify if the link text is visible, correct link text, and not disabled
    cy.get(loginmoduledata.cssSelectors[0].forgotyourpasswordLinktext)
      .wait(1000)
      .should('exist')
      .and('have.css', 'color', 'rgb(220, 38, 38)') //font color
      .and("have.attr", "href", "/forgot-password")
      .and('have.text', 'Forgot your password?')
      .and('not.be.disabled')
      .then(($el) => {
        const computedStyle = getComputedStyle($el[0]);
        const customPropertyValue = computedStyle.getPropertyValue('--tw-text-opacity').trim();
        expect(customPropertyValue).to.equal('1')
    })
  })

  it('Testcase ID: L0008 - Verify there is a Sign in button.', () => {

    //verify if the button is visible/exist, correct button name, text color, button color, edge or border radius of the button(meaning it shape like a capsule), height and width of the button
    cy.get(loginmoduledata.cssSelectors[0].submitButton)
      .should('exist')
      .and('have.css', 'color', 'rgb(255, 255, 255)') // text color
      .and('have.css', 'background-color', 'rgb(220, 38, 38)') //button color
      .and('have.css', 'border-radius', '9999px') //edge curve size
      .and('have.css', 'width', '368px') //width of the button
      .and('have.css', 'height', '38px') //height of the button
      .and('be.visible')
      .and('have.text', 'Sign in')
      .and('not.have.attr', 'disabled')
  })

  it('Testcase ID: L0009 - Verify user cannot successfully login if incorrect email address or not yet registered', () => {

    //enter incorrect or not yet registered email address
    cy.type_enter_data(loginmoduledata.cssSelectors[0].emailaddressInputfield, 'aldwin12345@gmail.com')
    //enter correct password
    cy.type_enter_data(loginmoduledata.cssSelectors[0].passwordInputfield, 'y6A7cH0tg8KB')
    //click sign in button
    cy.click_link_button(loginmoduledata.cssSelectors[0].submitButton)
      .wait(5000)
    //verify alert-error message popup 
    cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Authentication Error')
    cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Incorrect email or password')
    //verify it remains in the sign-in page
    cy.url().should('contain','/sign-in')
  })

  it('Testcase ID: L00010 - Verify user cannot successfully login if incorrect Password', () => {

    //enter correct or already registered email address
    cy.type_enter_data(loginmoduledata.cssSelectors[0].emailaddressInputfield, 'agencysu@betterseller.com')
    //enter incorrect password
    cy.type_enter_data(loginmoduledata.cssSelectors[0].passwordInputfield, 'y6A7cH0tg8KBsdas')
    //click sign in button
    cy.click_link_button(loginmoduledata.cssSelectors[0].submitButton)
      .wait(5000)
    //verify alert-error message popup 
    cy.getMessagepopup(alertmessageslocators.authenticationerror, 'Authentication Error')
    cy.getMessagepopup(alertmessageslocators.loginerrormessage, 'Incorrect email or password')
    //verify it remains in the sign-in page
    cy.url().should('contain','/sign-in')
  })

  it('Testcase ID: L00011 - Verify user can successfully login if Email address and Password are correct', () => {

    //enter correct or already registered email address
    cy.type_enter_data(loginmoduledata.cssSelectors[0].emailaddressInputfield, useraccountdata.usernameAdmin)
    //enter correct password
    cy.type_enter_data(loginmoduledata.cssSelectors[0].passwordInputfield, useraccountdata.adminpassword)
    //click sign in button
    cy.click_link_button(loginmoduledata.cssSelectors[0].submitButton)
      .wait(5000)
    //verify if it goes to Client > Workspace
    cy.url().should('contain', '/home/my-workspace')
    //verify the Workspace nav button is highlighted with white background red text signifies that it is accessed
    cy.get(BSmodulesnavlink.workspacenavlink)
      .should('exist')
      .and('have.text', 'Workspace')
      .and('have.css', 'color', 'rgb(239, 68, 68)') //text color
      .and('have.css', 'background-color', 'rgb(255, 255, 255)') //background color
  })
  //FORGOT PASSWORD PAGE

  it('Testcase ID: LFP0001 - Verify when user clicks the Forgot your password link text, it will go to Forgot your password page', () => {

    //click the forgot password? link text
    cy.get(loginmoduledata.cssSelectors[0].forgotyourpasswordLinktext).click()
    
    //verify if it goes to correct page - forgot password page
    cy.url().should('contain', '/forgot-password')
    
    //verify betterseller logo
    cy.get(loginmoduledata.cssSelectors[0].bettersellerLogo)
      .should('exist')
      .and('have.css', 'width', '48px')
      .and('have.css', 'height', '48px')
    
    //verify h2 title called Forgot your password?
    cy.get(loginmoduledata.cssSelectors[0].bettersellerHeaderTitle)
      .should('exist')
      .and('have.text', 'Forgot your password?')
    
    //verify instruction text
    cy.get(loginmoduledata.cssSelectors[0].Enteryouremailtoyourresetpassword)
      .should('exist')
      .and('have.text', 'Enter your email to your reset password.')
    
    //verify Email Address input field label is visible and correct
    cy.get(loginmoduledata.cssSelectors[0].EmailAddressLabel)
      .should('exist')
      .and('have.text','Email address')
    
    //verify Email Address input field is visible, empty, and enabled
    cy.get(loginmoduledata.cssSelectors[0].emailaddressInputfield)
      .should('exist')
      .and('have.value', '')
      .and('not.be.disabled')

    //verify Reset password button is visible, enabled, correct button name, text color, button color, edge or border radius of the button
    //(meaning it shape like a rectangle but with a little bit curve), height and width of the button 
    cy.get(loginmoduledata.cssSelectors[0].submitButton)
    .should('exist')
    .and('not.be.disabled')
    .and('have.css', 'color', 'rgb(255, 255, 255)') //font color
    .and('have.css', 'background-color', 'rgb(220, 38, 38)') //button color
    .and('have.css', 'border-radius', '6px') //the curve edges of the button
    .and('have.css', 'width', '368px')
    .and('have.css', 'height', '38px')
    .and('have.text', 'Reset Password')
  

    //verify if there is Did you remember your password? question text 
    cy.get(loginmoduledata.cssSelectors[0].Didyourememberyourpassword)
    .should('exist')
    .and('contain','Did you remember your password?')
    .and('be.visible')

    //verify Try loggin in link text is visible, correct link text, and not disabled
    cy.get(loginmoduledata.cssSelectors[0].TrylogginginLinktext)
    .should('exist')
    .and('have.text','Try logging in.')
    .and('not.be.disabled') 
  })

  it('Testcase ID: LFP0002 - Verify when user clicks the Try Logging in, it goes back to the main login page', () => {

    //click the forgot password? link text
    cy.click_link_button(loginmoduledata.cssSelectors[0].forgotyourpasswordLinktext)
    
    //click the Try logging in link text
    cy.click_link_button(loginmoduledata.cssSelectors[0].TrylogginginLinktext)

    //verify after clicking the Try logging in link if it goes back to the sign-in home page
    cy.url().should('contain', '/sign-in')
  })

  it('Testcase ID: LFP0003 - Verify when user attempts to reset password, but the email address is not yet registered in the betterseller.', () => {

    //click the forgot password? link text
    cy.click_link_button(loginmoduledata.cssSelectors[0].forgotyourpasswordLinktext)

    //enter an email address that is obviously not registered yet in the BetterSeller
    cy.type_enter_data(loginmoduledata.cssSelectors[0].emailaddressInputfield, 'aldwinsparks@gmail.com')
    
    //click the Reset Password button
    cy.click_link_button(loginmoduledata.cssSelectors[0].submitButton)

    //verify after clicking the Reset Password if it is success but the expected is that alert-error notification popup message and it remains in the reset password page
    cy.wait(3000)

    //verify alert-error message popup
    cy.getMessagepopup(alertmessageslocators.authenticationerror, 'There is no user with that email')
    
    //verify if it remains as it should be in the reset password page
    cy.url().should('contain', '/forgot-password')
  })

  it('Testcase ID: LFP0004 - Verify when user attempts to reset password Successfully.', () => {

    //click the forgot password? link text
    cy.click_link_button(loginmoduledata.cssSelectors[0].forgotyourpasswordLinktext)

    //enter an email address that is registered in the BetterSeller
    cy.type_enter_data(loginmoduledata.cssSelectors[0].emailaddressInputfield, useraccountdata.accountmanager)
    
    //click the Reset Password button
    cy.click_link_button(loginmoduledata.cssSelectors[0].submitButton)

    //verify after clicking the Reset Password it goes to forgot password success check you email page
    cy.url().should('contain', '/forgot-password/success') 

    //verify check your email page 
    //verify betterseller logo
    cy.get(loginmoduledata.cssSelectors[0].bettersellerLogo)
      .should('exist')
      .should('have.css', 'width', '48px')
      .should('have.css', 'height', '48px')

    //verify Check your email title
    cy.get(loginmoduledata.cssSelectors[0].bettersellerHeaderTitle)
      .should('exist')
      .and('have.text','Check your email')
      .and('have.css', 'font-weight', '800') // font bold

    //verify We just emailed you instructions on how to reset your password.
    cy.get(loginmoduledata.cssSelectors[0].resetpasswordsuccessinfotext)
      .should('exist')
      .and('have.text','We just emailed you instructions on how to reset your password.')
      
    /*verify Return to Login button is visible, enabled, correct button name, text color, button color, edge or border radius of the button
    (meaning it shape like a rectangle but with a little bit curve), height and width of the button */
    cy.get(loginmoduledata.cssSelectors[0].submitButton)
      .should('have.css', 'color', 'rgb(255, 255, 255)') //text color is white
      .should('have.css', 'background-color', 'rgb(220, 38, 38)') //button color is red
      .should('have.css', 'border-radius', '6px') //edge curve
      .should('have.css', 'width', '368px') //wdith size of the button
      .should('have.css', 'height', '38px') //height size of the button
      .and('exist')
      .and('have.text', 'Return to Login')
      .and('not.have.attr', 'disabled')

    //At this point it time I cannot verify the email if it was sent due to the limitation of the cypress
    //my gmail has this otp before it can login and that prohibits me from continuing at this test. I might shortcut this part
    
  })

})