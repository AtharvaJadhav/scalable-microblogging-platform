describe('User Registration Test', () => {
  it('should allow a new user to register', () => {
      cy.visit('http://localhost:3000/register'); // Replace with your app's URL

      cy.get('#username').type('abcde');
      cy.get('#email').type('abced@example.com');
      cy.get('#password').type('abced');

      // Use one of the options here
      cy.get('button.chakra-button').click(); // Option 1
      // OR
      cy.contains('button', 'register').click(); // Option 2
  });
});
