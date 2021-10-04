const express = require("express");
const app = express();
const PORT = 8080;
const findUserByEmail = require('./helpers');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');



app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const generateRandomString = function(stringLength) {

  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < stringLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateuserId = function(stringLength) {

  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz123456789";
  for (let i = 0; i < stringLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

app.set("view engine", "ejs");


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

const user1 = bcrypt.hashSync("cookinglessons",10);
const user2 = bcrypt.hashSync("meatlover",10);

const userDatabase = {
  eb849b1f: {
    id: 'eb849b1f',
    name: 'Kent Cook',
    email: 'really.kent.cook@kitchen.com',
    password: user1,
  },
  '1dc937ec': {
    id: '1dc937ec',
    name: 'Phil A. Mignon',
    email: 'good.philamignon@steak.com',
    password: user2,
  },
};


app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userid = generateuserId(6);
  let name = req.body.name;
  const hashedPassword = bcrypt.hashSync(password,10);
  
  
  if (email === "" || password === "" || name === "") {
    res.status(400).send("Please make sure no fields are empty");
  }
  
  let user = findUserByEmail(email,userDatabase);
  
  if (!user) {
    userDatabase[userid] = {
      id: userid,
      name,
      email,
      password: hashedPassword
    };

    
    req.session.user_id = userid;
    res.redirect('/urls');
  } else {
    res.status(400).send('User is already registered~');
  }

});

const findUserById = function(userId,userDatabase) {

  for (let user in userDatabase) {
   

    if (user === userId) {
      return userDatabase[user];
    }
  }
};


app.get('/register', (req, res) => {
  const templateVars = {
    urls:urlDatabase,
    userId:req.session.user_Id,
    user: findUserById(req.session.user_id,userDatabase)
   
  };
  res.render('urls_register',templateVars);
});






app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString(6);
  let userID = req.session.user_id;

  urlDatabase[shortURL] = {
    longURL,
    userID
  };
   
  res.redirect(`/urls/${shortURL}`);
       
});






app.post("/urls/:shortURL/delete", (req,res) => {
  if (!findUserById(req.session.user_id,userDatabase)) {
    return res.status(400).send("Not Authorized");
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});




app.get("/urls/new", (req,res) => {
  const templateVars = {
    urls:urlDatabase,
    userid:req.session.user_id,
    user: findUserById(req.session.user_id,userDatabase)
   
  };

  if (templateVars.userid === undefined) {
    return res.redirect('/login');
  } else {
    return res.render("urls_new",templateVars);
  }
  
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
    userId:req.session.user_Id,
    user: findUserById(req.session.user_id,userDatabase)
    
  };
  

  if(urlDatabase[templateVars.shortURL].userID === templateVars.user.id) {
    return res.render("urls_show", templateVars);
  } 
  res.status(403).send('You do not have permission to edit this URL.')
});


app.post("/urls/:shortURL", (req,res) => {

  if (!findUserById(req.session.user_id,userDatabase)) {
    return res.status(400).send("Not Authorized");
  }
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL;

  urlDatabase[shortURL].longURL = newLongURL;
  
  res.redirect('/urls');
  

});


app.get('/login', (req, res) => {
  const templateVars = {
    
    urls:urlDatabase,
    userId:req.session.user_id,
    user: findUserById(req.session.user_id,userDatabase) 
    
  };
  

  
  
  res.render('urls_login',templateVars);
});


app.post('/login',(req,res) => {

  let email = req.body.email;
  let password = req.body.password;
  const user = findUserByEmail(email,userDatabase);


  if (!user) {
    res.status(400).send("Sorry we cannot find that user");
  } else {
  
    let hashedPassword = bcrypt.compareSync(password,user.password);

    if (hashedPassword) {
    
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(400).send("PASSWORD IS INCORRECT");
    }
  }

});

app.post('/logout', (req,res) => {

  req.session = null;
  res.redirect('/urls');

});

const findUrlById = function(userid,urlDatabase) {
  const urls = {};
  for (let url in urlDatabase) {
    

    if (userid === urlDatabase[url].userID) {
      
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

app.get("/urls", (req,res) => {
  const templateVars = {
    urls:findUrlById(req.session.user_id,urlDatabase),
    userid:req.session.user_id,
    user: findUserById(req.session.user_id,userDatabase)
    
  };

  
  res.render("urls_index", templateVars);

});

app.get("/", (req,res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req,res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



