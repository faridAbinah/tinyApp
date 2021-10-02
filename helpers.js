const findUserByEmail = function(email,userDatabase) {
  
  for(let user in userDatabase) {
    

     if(email === userDatabase[user].email) {
      
      return userDatabase[user];
     }

  }

};



findUserByEmail()

module.exports = findUserByEmail;

