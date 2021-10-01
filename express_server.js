const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
//fire up cookie parser
app.use(cookieParser());


const generateRandomString = function(stringLength) {

  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz";
  for(let i = 0; i < stringLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const generateuserId = function(stringLength) {

  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz123456789";
  for(let i = 0; i < stringLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.set("view engine", "ejs");
/**
 * 
 */
// const urlDatabase = {
//   "b2xVn2": {
//     //shortURL:"b2xVn2",
//     longURL: "http://www.lighthouselabs.ca",
//  
// },
//   "9sm5xK": {
//     shortURL:"9sm5xK",
//     longURL: "http://www.google.com"
//   }
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "eb849b1f"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "1dc937ec"
  }
};

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

//register
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userid = generateuserId(6);
  let name = req.body.name;
  
  if(email === "" || password === "" || name === "") {
    res.status(400).send("Please make sure no fields are empty");
  }

  
  
  
  

  
  let user = findUserByEmail(email);
  
  if(!user) {
    userDatabase[userid] = {
      id: userid,
      name,
      email,
      password
    };

    res.cookie('user_id', userid);
    res.redirect('/urls');
  } else {
    res.status(400).send('User is already registered~');
  }

  //console.log(userDatabase);
  

  
  



});

const findUserByEmail = function(email) {
  
    for(let user in userDatabase) {
      
  
       if(email === userDatabase[user].email) {
        
        return userDatabase[user];
       }
    }
  
};
const findUserById = function(userId) {

  for(let user in userDatabase) {
   

    if(user === userId) {
      return userDatabase[user];
    }
  }
};

//register
app.get('/register', (req, res) => {
  const templateVars = { 
    urls:urlDatabase,
    userId:req.cookies.user_Id,
    user: findUserById(req.cookies.user_id)
   
  };
  res.render('urls_register',templateVars);
});






app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString(6);
  let userID = req.cookies.user_id;

  urlDatabase[shortURL] = {
    longURL,
    userID
  } ; 
   console.log(urlDatabase);
   res.redirect(`/urls/${shortURL}`);  
       
});





//delete
app.post("/urls/:shortURL/delete", (req,res) => {
  if(!findUserById(req.cookies.user_id)) {
    return res.status(400).send("Not Authorized");
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(req.cookies.user_id);
  res.redirect("/urls");


  
 
  

});




app.get("/urls/new", (req,res) => {
  const templateVars = { 
    urls:urlDatabase,
    userid:req.cookies.user_id,
    user: findUserById(req.cookies.user_id)
   
  };

  if(templateVars.userid === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new",templateVars);
  }
  res.render("urls_new",templateVars);
});

app.get('/u/:shortURL', (req,res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req,res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL].longURL,
    userId:req.cookies.user_Id,
    user: findUserById(req.cookies.user_id)
    
  }
  res.render("urls_show", templateVars);
});

//Update here
app.post("/urls/:shortURL", (req,res) => {

  if(!findUserById(req.cookies.user_id)) {
    return res.status(400).send("Not Authorized");
  }
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL;

  urlDatabase[shortURL].longURL = newLongURL;
  
  res.redirect('/urls');
  //console.log(req.body.longURL);

});

//login GET route
app.get('/login', (req, res) => {
  const templateVars = { 
    
    urls:urlDatabase,
    userId:req.cookies.user_id,
    user: findUserById(req.cookies.user_id)
    
  };
  //  console.log(` urls:${templateVars} , /n userId: ${templateVars.userId}  user: ` );

  
  
  res.render('urls_login',templateVars);
});
//Login Post Route

app.post('/login',(req,res) => {

let email = req.body.email;
let password = req.body.password
console.log(`Email: ${email},Password: ${password}`);


const user = findUserByEmail(email);
console.log(`Find User By Email: ${user.name}`);

if(!user) {
  res.status(400).send("Sorry we cannot find that user")
} else {
  
  

  if(password === user.password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(400).send("PASSWORD IS INCORRECT")
  }
}
// set a cookie named username res.cookie
//access cookie req.cookie



});

app.post('/logout', (req,res) => {

    res.clearCookie('user_id');
    res.redirect('/urls');

});

const findUrlById = function(userid) {
  const urls = {}
  for(let url in urlDatabase) {
    console.log(urlDatabase[url].userID);

    if(userid === urlDatabase[url].userID){
      
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};
//here
app.get("/urls", (req,res) => {
  const templateVars = { 
    urls:findUrlById(req.cookies.user_id),
    userid:req.cookies.user_id,
    user: findUserById(req.cookies.user_id)
    
  };
  // console.log(req.cookies.user_id,templateVars.user);

   
  res.render("urls_index", templateVars);

});
app.get("/", (req,res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req,res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



