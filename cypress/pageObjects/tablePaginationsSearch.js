/// <reference types="cypress" />

class tablesearchpagination
{
    static searchNameInTable(name) {
        let isNameFound = false;
        let clienturlforpagination = '';
        function searchInCurrentPage() {
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
                          cy.log('DIARA JUD '+clienturlforpagination);
                        })
                      return false; // This breaks out of the .each() loop if client name is found
                    }
                  });
                });
              }
          })
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
          return clienturlforpagination || '';; // Return the storedValue
      }
      
}

export default tablesearchpagination;