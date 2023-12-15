/// <reference types="cypress" />


class utilityfunctions
{
    
    changeonetexttoanotherbackandforth(inputfieldlocator, nameText1, nameText2)
    {

      cy.get(inputfieldlocator).then((subject) => {
        const initialText = subject.val();
        if (initialText === nameText1) {
          cy.log('Initial name text is correct, changing to new name ...');
          cy.get(inputfieldlocator)
            .clear().type(nameText2); // Change the text to 'New Text' 
          cy.log('I JUST CHANGE THE NAME TEXT INTO THIS', nameText2)   
        } else {
          cy.log('Initial name text is not as expected, not changing the name text.');
          cy.get(inputfieldlocator)
            .clear().type(nameText1)
          cy.log('I JUST CHANGE THE NAME TEXT INTO THIS', nameText1)   
        }
      })
    }
    EditClientName(clientnamevalue, clientnameText1, clientnameText2, updatelocator, alertmessagelocator1, alertmessagelocator2, clientnameheaderlocator, activeclientlocator)
    {
      if(clientnamevalue === clientnameText1){ //if the current value of the client name input field at edit profile page is AAAROO TEST A
        cy.log('Initial text is correct, changing to new text...');
        //then I will have to replace with new name which is AAAROO TEST B
        cy.get('input[name="client"]')
          .clear()
          .type(clientnameText2)
          .wait(1000)
          .should('have.value', clientnameText2)

        //verify the update button
        cy.get(updatelocator).scrollIntoView()
          .should('exist')
          .and('not.be.disabled')
          .and('have.css', 'color', 'rgb(255, 255, 255)')
          .and('have.css', 'background-color', 'rgb(185, 28, 28)')  //background color that form like a capsule
          .and('have.css', 'border-radius', '16px')   //the curve edge of the background color
          .click()
          .wait(3000)
  
        //verify alert-success message popup 
        cy.getMessagepopup(alertmessagelocator1, 'Update Success')
        cy.getMessagepopup(alertmessagelocator2, 'Agency Client details were successfully updated')
        
        //Since it was change, then it is expected that the client name title also changes
        cy.get(clientnameheaderlocator)
          .should('have.text', clientnameText2)
          
        //Then here verify in the table that it is also updated
        //Click the Active Clients link text folder
        cy.get(activeclientlocator)
          .should('exist')
          .click()
          .wait(1000)
        //At Row 1 the editted client name
        cy.get('table > tbody > tr:first-child > td > a')
          .should('have.text', clientnameText2)
      }else{
        cy.log('Initial text is not as expected, not changing the text.');  //meaning the current value name is AAAROO TEST B
        //and so change the name into AAAROO TEST A
        cy.get('input[name="client"]')
          .clear()
          .type(clientnameText1)
          .wait(1000)
          .should('have.value', clientnameText1)

        //verify the update button
        cy.get(updatelocator).scrollIntoView()
          .should('exist')
          .and('not.be.disabled')
          .and('have.css', 'color', 'rgb(255, 255, 255)')
          .and('have.css', 'background-color', 'rgb(185, 28, 28)')  //background color that form like a capsule
          .and('have.css', 'border-radius', '16px')   //the curve edge of the background color
          .click()
          .wait(3000)
  
        //verify alert-success message popup 
        cy.getMessagepopup(alertmessagelocator1, 'Update Success')
        cy.getMessagepopup(alertmessagelocator2, 'Agency Client details were successfully updated')
        
        //Since it was change, then it is expected that the client name title also changes
        cy.get(clientnameheaderlocator)
          .should('have.text', clientnameText1)

        //Then here verify in the table that it is also updated
        //Click the Active Clients link text folder
        cy.get(activeclientlocator)
          .should('exist')
          .click()
          .wait(1000)
        //At Row 1 the editted client name
        cy.get('table > tbody > tr:first-child > td > a')
          .should('have.text', clientnameText1)
      }
    }
    getFormattedDate() {
      const currentDate = new Date();
      const day = currentDate.getDate();

      // Use the 'short' option to get the abbreviated month
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      const year = currentDate.getFullYear();

      const formattedDate = `${day} ${month} ${year}`;
      return formattedDate;
    }
    getFormattedDateNoSpaceInBetween(){
      const currentDate = new Date();
      const day = currentDate.getDate();

      // Use the 'short' option to get the abbreviated month
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      const year = currentDate.getFullYear();

      const formattedDate = `${day}${month}${year}`;
      return formattedDate;
    }
    getFormattedDatePlus5days() {
      const currentDate = new Date();
      const day = currentDate.getDate() + 5; // Add 5 days to the current day

      // Use the 'short' option to get the abbreviated month
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      const year = currentDate.getFullYear();

      const formattedDate = `${day} ${month} ${year}`;
      return formattedDate;
    }
    getFormattedDateMonthDayyear(){
      const currentDate = new Date();
      const day = currentDate.getDate(); // Add 5 days to the current day

      // Use the 'short' option to get the abbreviated month
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      const year = currentDate.getFullYear();

      const formattedDate = `${month} ${day}, ${year}`;
      return formattedDate;
    }
    getFormattedDateYearMonthDayWithDash(){
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1; // Get the current month (adding 1 because months are zero-indexed)
      const day = currentDate.getDate(); // Get the current day
      const year = currentDate.getFullYear(); // Get the current year

      // Function to add leading zero if needed
      function addLeadingZero(value) {
          return value < 10 ? `0${value}` : value;
      }

      // Format month, day, and year with leading zeros if necessary
      const formattedMonth = addLeadingZero(month);
      const formattedDay = addLeadingZero(day);

      const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
      return formattedDate;
    }
    getFormattedDateYearMonthDay()
    {
      const currentDate = new Date();
      const day = currentDate.getDate(); // Get the current day
      const month = currentDate.getMonth() + 1; // Get the current month (Note: January is 0, so add 1)
      const year = currentDate.getFullYear(); // Get the current year

      // Format month and day with leading zeros if necessary
      const formattedMonth = month < 10 ? `0${month}` : month;
      const formattedDay = day < 10 ? `0${day}` : day;

      const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
      return formattedDate;

      /*
      This code uses getMonth() to get the month (where January is represented as 0, February as 1, and so on). 
      We add 1 to the month to get the actual month number. 
      Then, it checks if the month or day is less than 10 to append a leading zero if necessary for the desired format (e.g., '01' for January or '05' for the 5th day). 
      Finally, it constructs the formatted date in the "yyyy-num-num" format and returns it.
       */

    }
    getFormattedDateDayMonthyear()
    {
      const currentDate = new Date();
      const day = currentDate.getDate();

      // Use the 'short' option to get the abbreviated month
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      const year = currentDate.getFullYear();

      const formattedDate = `${day} ${month} ${year}`;
      return formattedDate;
    }
    getFormattedDateMonthDayYearVersion2()
    {
      const currentDate = new Date();
      const day = currentDate.getDate(); // Get the current day
      const monthIndex = currentDate.getMonth(); // Get the current month index (0-11)
      const year = currentDate.getFullYear(); // Get the current year

      // Array of month names
      const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October', 'November', 'December'
      ];

      // Get the month name based on the month index
      const month = monthNames[monthIndex];

      // Function to add suffix to the day
      function getDayWithSuffix(day) {
          if (day >= 11 && day <= 13) {
              return `${day}th`;
          } else {
              const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
              const lastDigit = day.toString().slice(-1);
              return `${day}${suffixes[lastDigit] || 'th'}`;
          }
      }

      const formattedDay = getDayWithSuffix(day);

      const formattedDate = `${month} ${formattedDay} ${year}`;
      return formattedDate;
    }
    getFormattedDateMonthDayYearVersion3(){
      const currentDate = new Date();
      const day = currentDate.getDate(); // Get the current day
      const year = currentDate.getFullYear(); // Get the current year
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      // Function to remove suffix from the day
      function getDayWithoutSuffix(day) {
          return day.toString();
      }

      const formattedDay = getDayWithoutSuffix(day);

      const formattedDate = `${month} ${formattedDay}, ${year}`;
      return formattedDate;
    }
    geteachcolumnsinarow(tablerowlocator, creditnotename, amount)
    {
      cy.get(tablerowlocator).within(()=>{

        // GET LAST ROW COL 1 - CREDIT NOTE NAME
        cy.get('td:nth-child(1) > a')
          .should('be.visible')
          .and('exist')
          .and('not.be.disabled')
          .and('have.text', creditnotename+this.getFormattedDateNoSpaceInBetween())
        //GET ROW 1 COL 2 - SUBMISSION DATE
        cy.get('td:nth-child(2) > span')
          .should('be.visible')
          .and('exist')
          .and('have.text', this.getFormattedDate())
        //GET ROW 1 COL 3 - AMOUNT
        cy.get('td:nth-child(3) > span')
          .should('be.visible')
          .and('exist')
          .and('have.text', '$'+amount)
        //GET ROW 1 COL 4 - STATUS
        cy.get('td:nth-child(4) > span')
          .should('be.visible')
          .and('exist')
          .and('have.css', 'color', 'rgb(245, 158, 11)')//font color text
          .and('have.css', 'font-weight', '500') //bold font
          .and('have.css', 'background-color', 'rgb(254, 243, 199)') //background color
          .and('have.css', 'border-radius', '9999px') //border radius or the curve edge
          .and('have.css', 'width', '85.71875px')
          .and('have.css', 'height', '32px')
          .and('have.text', 'Pending')
        //GET ROW 1 COL 5 - SUBMITTED BY
        cy.get('td:nth-child(5) > span > span:nth-child(2)')
          .should('be.visible')
          .and('exist')
          .and('have.text', 'BS Admin')
        //GET ROW 1 COL 7 - ACTION [ CANCEL BUTTON ] ALSO IT SKIP TO  COL 7
        cy.get('td:nth-child(7) > button')
          .should('be.visible')
          .and('exist')
          .and('have.css', 'font-size', '11px')//font size
          .and('have.css', 'font-weight', '500') //bold font
          .and('have.css', 'border-color', 'rgb(156, 163, 175)') //outer line
          .and('have.css', 'width', '72.890625px')
          .and('have.css', 'border-radius', '9999px') //border radius or the curve edge
          .and('have.text', 'Cancel')
          .and('not.be.disabled')
      })
    }
    uploadclientprofilephoto(locator) {
      //i will have to check first if there is an image already uploaded
      cy.get('div.col-span-2 > div.relative > img').should('exist').and('be.visible').then(()=>{
        //since there is, then I check if what was that image whether it is 'azoginsuit.jpg' or 'sampMalePic.jpg'
        cy.get('div.col-span-2 > div.relative > img').invoke('attr', 'src').then((src) => {
          // Check if the src attribute contains 'azoginsuit.jpg'
          if (src && src.includes('azoginsuit.jpg')) {
            // If it contains 'a1.jpg', upload 'sampMalePic.jpg'
            cy.get(locator).attachFile('sampMalePic.jpg')
              .wait(2000)
          } else {
            // Otherwise, upload 'a1.jpg'
            cy.get(locator).attachFile('azoginsuit.jpg')
              .wait(2000)
          }
        })
      })
      
    }
    assertingwidthis50percentandcorrectrgbcoloreffect(locator, rgbcolor){
      const spElement = document.querySelector(locator); // Replace with your actual selector
      if (spElement) {
        const computedWidth = window.getComputedStyle(spElement).getPropertyValue('width').trim();
        const computedColor = window.getComputedStyle(spElement).getPropertyValue('color').trim();
        if (computedWidth === '50%' && computedColor === rgbcolor) {
          console.log(`Width is 50% and color is ${rgbcolor}`);
        } else {
          console.error('Width or color is not as expected');
        }
      } else {
        console.error('Element not found');
      }
    }
    maybeClickNext(locator){
      cy.get(locator)
      .if('enabled')
      .wait(1000)
      .log('clicking next')
      // because we used "cy.log"
      // we removed the button subject, so need to query again
      .get(locator)
      .click()
      .then(maybeClickNext)
      .else()
      .log('last page')
    }
}
export default utilityfunctions;
