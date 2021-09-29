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

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    shortURL:"b2xVn2",
    longURL: "http://www.lighthouselabs.ca"
},
  "9sm5xK": {
    shortURL:"9sm5xK",
    longURL: "http://www.google.com"
  }
};



let shortURL = generateRandomString(6);


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    shortURL,
    longURL
  } ; 
   console.log(urlDatabase);
   res.redirect(`/urls/${shortURL}`);  
       
});

//delete
app.post("/urls/:shortURL/delete", (req,res) => {

  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  
  res.redirect("/urls");
  
 
  

});




app.get("/urls/new", (req,res) => {

  res.render("urls_new");
});

app.get('/u/:shortURL', (req,res) => {
  
  let longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req,res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL].longURL,
    username:req.cookies.username
  }
  res.render("urls_show", templateVars);
});

//Update
app.post("/urls/:shortURL", (req,res) => {
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL;

  urlDatabase[shortURL].longURL = newLongURL;
  
  res.redirect('/urls');
  //console.log(req.body.longURL);

});

//Login Post Route

app.post('/login',(req,res) => {

let username = req.body.username;

// set a cookie named username res.cookie
//access cookie req.cookie
res.cookie('username', username);
console.log(username);
res.redirect('/urls');


});

app.post('/logout', (req,res) => {

    res.clearCookie('username');
    res.redirect('/urls');

});



app.get("/urls", (req,res) => {
  const templateVars = { 
    urls:urlDatabase,
    username:req.cookies.username
  };
  console.log(req.cookies.username);
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



