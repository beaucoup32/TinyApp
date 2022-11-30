const express = require("express");
const { url } = require("inspector");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
// set view engine to ejs
app.set("view engine", "ejs");

// read cookies
app.use(cookieParser());

let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandUrl = () => {
  const randUrl = Math.random().toString(36).slice(2, 8);
  return randUrl;
};

// console.log(generateRandUrl());
// middleware (middle man) -> sets encoding
app.use(express.urlencoded({ extended: true }));

//use res.render to load up ejs view file

// ROOT PAGE //
// app.get("/", (req, res) => {
//   templateVars = {
//     main: "Drip Drop",
//   };

//   res.render("dripDrop", templateVars);
// });

app.get("/urls", (req, res) => {
  const username = req.body.username;

  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
  };

  
  // console.log('req cookies: ', req.cookies);

  return res.render("urls_index", templateVars);
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
  const username = req.body.username;
  // console.log(username);
  
  res.cookie('username', username);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username;

  
  res.clearCookie('username', username);
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

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  return res.render("urls_new", templateVars);
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
    username: req.cookies["username"],
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
