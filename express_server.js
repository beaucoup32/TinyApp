const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

// set view engine to ejs
app.set("view engine", "ejs");

// MIDDLE WARE //
app.use(cookieParser()); // read cookies
app.use(express.urlencoded({ extended: true })); // sets encoding
app.use(morgan('dev'));

// Databases //
let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandUrl = () => {
  const randUrl = Math.random().toString(36).slice(2, 8);
  return randUrl;
};

const getUserByEmail = (email) => {
  for (let userKey in users) {
    if (email == users[userKey].email) {
      return users[userKey];
    }
  }
  return null;
};

// console.log(generateRandUrl());

//use res.render to load up ejs view file
/*
// ROOT PAGE //
// app.get("/", (req, res) => {
//   templateVars = {
//     main: "Drip Drop",
//   };

//   res.render("dripDrop", templateVars);
// });
*/

// POST//

// REGISTER //
app.post("/register", (req, res) => {
  // generate unique id
  let user_id = generateRandUrl();

  // form info
  const info = req.body;

  //create user obj from form
  let newUser = { id: user_id, email: info.email, password: info.password };

  // check if email and pass are empty
  if (!info.email || !info.password) {
    return res.status(400).send("Email or Password field is empty");
  }

  //check to see if user email is in database
  if (getUserByEmail(info.email)) {
    return res.status(401).send("email already in use");
  }

  // add user to database
  users[newUser.id] = newUser;

  console.log('users', users);
  //return cookie with form data
  res.cookie('user_id', newUser);

  // console.log('users', users);
  return res.redirect("/urls");
});

//  CREATE NEW SHORT URL //
app.post("/urls", (req, res) => {

  let id = generateRandUrl();
  urlDatabase[id] = req.body.longURL;

  return res.redirect(`/urls/${id}`);
});

// EDIT EXISTING URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.editURL;

  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id] = newURL;
    console.log(`URL successfully changed`);
  }
  return res.redirect("/urls");
});

// LOG IN //
app.post("/login", (req, res) => {

  const { email, password } = {email:req.body.email, password:req.body.password};

  
  // check if email or pass is undefined
  if (!email || !password) {
    return res.status(400).send('Missing Email or Password');
  }
  
  let user = getUserByEmail(email);
  // check if email exists in database
  if (!user) {
    return res.status(403).send('Email does not exist')
  }

  // check if password is correct
  if (password !== user.password) {
    return res.status(403).send('Password does not match')
  }

  
  let user_id = user.id;

  res.cookie('user_id', user);
  // console.log('user', user);
  return res.redirect("/urls");
});

// LOG OUT//
app.post("/logout", (req, res) => {
  const user_id = req.cookies;
  // console.log('id', id);
  // console.log(user_id);

  res.clearCookie('user_id');
  return res.redirect("/login");
});

// DELETE URLS //
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  console.log(`Deleting shortURL: ${id} ==> ${urlDatabase[id]}`);
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// EDIT EXISTING URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.editURL;

  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id] = newURL;
    console.log(`URL successfully changed`);
  }
  return res.redirect("/urls");
});

// GET //
app.get("/urls", (req, res) => {
  let user_id = req.cookies.user_id;

  console.log(user_id);
  if (!user_id) {
    user_id = null;
  }

  //render page w user email + info
  // const user = users[user_id]

  const templateVars = {
    urls: urlDatabase,
    user: user_id,
  };

  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id;

  console.log(user_id);
  if (!user_id) {
    user_id = null;
  }

  //render page w user email + info
  // const user = users[user_id]

  const templateVars = {
    urls: urlDatabase,
    user: user_id,
  };
  return res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => { 
  let user_id = req.cookies.user_id;

  if (!user_id) {
    user_id = null;
  }

  const templateVars = {
    urls: urlDatabase,
    user: user_id,
  };

  return res.render("register", templateVars);
});

app.get("/login" ,(req, res) => {
  let user_id = req.cookies.user_id;

  if (!user_id) {
    user_id = null;
  }

  const templateVars = {
    urls: urlDatabase,
    user: user_id,
  };

  return res.render("login", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  return res.redirect(longURL);
});

app.get("/about", (req, res) => {
  return res.render("pages/about");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/dripDrop", (req, res) => {
//   templateVars = {
//     username: req.cookies['username'],
//     main: "Drip Drop",
//   };

//   res.render("dripDrop", templateVars);
// });

// SHOW SHORT URLS //
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  let user_id = req.cookies.user_id;

  if (!user_id) {
    user_id = null;
  }
  const templateVars = {
    user: user_id,
    id: id,
    longURL: urlDatabase[id],
  };

  return res.render("urls_show", templateVars);
});

app.get("*", (req, res) => {
  return res.render("404");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
