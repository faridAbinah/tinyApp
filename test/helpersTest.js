const { assert } = require('chai');

const findUserByEmail  = require('../helpers.js');

const userDatabase = {
  eb849b1f: {
    id: 'eb849b1f',
    name: 'Kent Cook',
    email: 'really.kent.cook@kitchen.com',
    password: 'cookinglessons',
  },
  '1dc937ec': {
    id: '1dc937ec',
    name: 'Phil A. Mignon',
    email: 'good.philamignon@steak.com',
    password: 'meatlover',
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("good.philamignon@steak.com", userDatabase)
    const expectedOutput = {
      id: '1dc937ec',
      name: 'Phil A. Mignon',
      email: 'good.philamignon@steak.com',
      password: 'meatlover'
    } ;
    // Write your assert statement here
   // console.log(user); Use deep equal 
    assert.deepEqual(user,expectedOutput);
  });

  it('Should return undefined if no user is found', function() {
    const user = findUserByEmail("good.philamignon@stea.com", userDatabase);
    const expectedOutput = undefined;

    assert.deepEqual(user,expectedOutput);
  })
});