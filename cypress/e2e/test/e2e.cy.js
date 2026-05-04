
const fs = require('fs')

it('shows input fields and submit button', () => {
    cy.visit('http://localhost:3000');
    cy.get('#sensor_Name').should('exist');
    cy.get('#sensor_coordinates').should('exist');
    cy.get('#sensor_type').should('exist');
    cy.get('#sensor_value').should('exist');
    cy.get('#addsensor_Btn').should('exist');
})

it('submits form and shows new sensor', () => {
    cy.visit('http://localhost:3000');
    cy.get('#sensor_Name').type('Sensor4');
    cy.get('#sensor_coordinates').type('3,3');
    cy.get('#sensor_type').type('light');
    cy.get('#sensor_value').type('300');
    cy.get('#addsensor_Btn').click();
    cy.get('#listsensor_Btn').click();
    cy.contains('Sensor4').should('exist');
    cy.contains('3,3').should('exist');
    cy.contains('light').should('exist');
    cy.contains('300').should('exist');
})

it('shows error message on invalid input', () => {
    cy.visit('http://localhost:3000');
    cy.get('#sensor_Name').type('Sensor5');
    cy.get('#addsensor_Btn').click();
    cy.contains('Invalid input').should('exist');
})

it('lists all sensors', () => {
    cy.visit('http://localhost:3000');
    cy.get('#listsensor_Btn').click();
    cy.contains('Sensor4').should('exist');
})

it('clears list on empty list', () => {
    cy.visit('http://localhost:3000');
    cy.intercept('GET', '/api/sensors', { body: [] }).as('getEmptySensors');
    cy.get('#listsensor_Btn').click();
    cy.wait('@getEmptySensors');
    cy.contains('No sensors found').should('exist');
});

it('sends DELETE request on delete button click', () => {
    cy.visit('http://localhost:3000');
    cy.get('#listsensor_Btn').click();
    cy.intercept('DELETE', '/api/sensors/*').as('deleteSensor');
    cy.get('.delsensor').first().click();
    cy.wait('@deleteSensor').its('request.method').should('equal', 'DELETE');
})

it('sends PUT request on update button click', () => {
    cy.visit('http://localhost:3000');
    cy.get('#listsensor_Btn').click();  
    cy.intercept('PUT', '/api/sensors/*').as('updateSensor');
    cy.get('.updsensor').first().click();
    cy.wait('@updateSensor').its('request.method').should('equal', 'PUT');
})
    
it('sends correct data on update button click', () => {
cy.visit('http://localhost:3000');

    cy.intercept('PUT', '/api/sensors/*', {
    statusCode: 200,
    body: { id: 1, name: 'UpdatedName', coordinates: '5,5', type: 'humidity', value: 55 }
    }).as('updateSensor');


    cy.get('#listsensor_Btn').click();
    cy.get('.updsensor').first().click();

    cy.wait('@updateSensor').its('request.method').should('equal', 'PUT');
    cy.get('#out').should('contain', 'Updated:');
});

it('handles update errors gracefully', () => {
    cy.visit('http://localhost:3000');
    cy.intercept('PUT', '/api/sensors/*', {
    statusCode: 500,
    body: { error: 'Database error' }
    }).as('updateSensorError');
    
    cy.get('#listsensor_Btn').click();
    cy.get('.updsensor').first().click();
    cy.wait('@updateSensorError');
});
