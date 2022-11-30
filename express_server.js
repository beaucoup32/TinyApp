const express = require("express");
const { url } = require("inspector");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

// set view engine to ejs
app.set("view engine", "ejs");

// MIDDLE WARE //
app.use(cookieParser()); // read cookies
app.use(express.urlencoded({ extended: true })); // sets encoding

// Databases //
let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
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
      return users[userKey]
    }
  }
  return null;
}

// console.log(generateRandUrl());


//use res.render to load up ejs view file

// ROOT PAGE //
// app.get("/", (req, res) => {
//   templateVars = {
//     main: "Drip Drop",
//   };

//   res.render("dripDrop", templateVars);
// });

// POST//

// REGISTER //

app.post("/register", (req, res) => {
  // generate unique id
  let user_id = generateRandUrl();

  // form info
  const info = req.body;


  //create user obj from form
  user_id = {id: user_id, email:info.email, password:info.password};

  
 
  // check if email and pass are empty
  if (!info.email || !info.password) {
    return res.status(400).send('Email or Password field is empty')
  }
    

  //check to see if user email is in database
  if (getUserByEmail(info.email)) {
    return res.status(401).send('email already in use');
  }

  // add user to database
  users[user_id.id] = user_id;
  
  //return cookie with form data
  res.cookie(user_id.id, user_id);
  
  
  
  
  // console.log('users', users);
  return res.redirect("/urls");
});

//  CREATE NEW SHORT URL //
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandUrl();
  urlDatabase[id] = req.body.longURL;
  
  console.log(urlDatabase);
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
  const email = req.body.email;
  // console.log(username);
  
  res.cookie(user_id, email);
  return res.redirect("/urls");
});

// LOG OUT//
app.post("/logout", (req, res) => {
  const id = req.body.user_id.id;
  
  
  res.clearCookie('user_id', username);
  return res.redirect("/urls");
});

// DELETE URLS //
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  console.log(`Deleting shortURL: ${id} ==> ${urlDatabase[id]}`);
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// EDIT EXISTING URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.editURL
  
  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id] = newURL;
    console.log(`URL successfully changed`);
    
  }
  return res.redirect('/urls')
})

// GET //
app.get("/urls", (req, res) => {
  // const username = req.body.username;

  const templateVars = {
    urls: urlDatabase,
    users
  };

  
  // console.log('req cookies: ', req.cookies);

  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    users,
  }
  return res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {


  const templateVars = {
    urls: urlDatabase,
    users,
  };

  
  // console.log('req cookies: ', req.cookies);

  return res.render("register", templateVars);
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
  const templateVars = {
    users,
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
