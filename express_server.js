const { getUserByEmail, generateRandUrl } = require("./helpers");
const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const app = express();
const PORT = 8080;

// set view engine to ejs
app.set("view engine", "ejs");

// MIDDLE WARE //
app.use(
  cookieSession({
    name: "session",
    keys: ["beaucoup"],
  })
);
app.use(express.urlencoded({ extended: true })); // sets encoding
app.use(morgan("dev")); // visualize method + actions

// Databases //
let urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", 10),
  },
  test: {
    id: "test",
    email: "ego@check.com",
    password: bcrypt.hashSync("x", 10),
  },
};

// helper function
const urlsForUser = (user_id) => {
  let validLinks = {};
  for (let key in urlDatabase) {
    if (user_id.id == urlDatabase[key].userID) {
      validLinks[key] = urlDatabase[key];
    }
  }

  return validLinks;
};

// POST//

// REGISTER //
app.post("/register", (req, res) => {
  // generate unique id
  let user_id = generateRandUrl();

  // form info
  const info = req.body;

  // hash password
  const password = info.password;
  const hashedPass = bcrypt.hashSync(password, 10);

  //create user obj from form
  let newUser = { id: user_id, email: info.email, password: hashedPass };

  // check if email and pass are empty
  if (!info.email || !info.password) {
    return res.status(400).send("Email or Password field is empty");
  }

  //check to see if user email is in database
  if (getUserByEmail(info.email, users)) {
    return res.status(401).send("email already in use");
  }

  // add user to database
  users[newUser.id] = newUser;

  //return cookie with form data
  req.session.beaucoup = newUser;

  return res.redirect("/urls");
});

//  CREATE NEW SHORT URL //
app.post("/urls", (req, res) => {
  let user_id = req.session.beaucoup;
  const longURL = req.body.longURL;

  // check if user is logged in
  if (!user_id) {
    return res.status(401).send("You need to be logged in to shorten URLs");
  }

  let id = generateRandUrl();

  urlDatabase[id] = { longURL: longURL, userID: user_id.id };

  return res.redirect(`/urls/${id}`);
});

// EDIT EXISTING URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.editURL;
  let user_id = req.session.beaucoup;

  // check if user is logged in
  if (!user_id) {
    return res.status(402).send("Not logged in");
  }

  // check if short id is in database
  if (!urlDatabase.hasOwnProperty(id)) {
    return res.status(400).send("this id does not exist");
  }

  // check if user owns short link
  if (!urlsForUser(user_id)) {
    return res.status(401).send("You do not own this id");
  }

  // update long url
  urlDatabase[id].longURL = newURL;

  return res.redirect("/urls");
});

// LOG IN //
app.post("/login", (req, res) => {
  const { email, password } = {
    email: req.body.email,
    password: req.body.password,
  };

  // check if email or pass is undefined
  if (!email || !password) {
    return res.status(400).send("Missing Email or Password");
  }

  // check if email exists in database
  let user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Email does not exist");
  }

  // check if password is correct
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password does not match");
  }

  // set encrypted cookie
  req.session.beaucoup = user;

  return res.redirect("/urls");
});

// LOG OUT//
app.post("/logout", (req, res) => {
  // clear cookie
  req.session = null;
  return res.redirect("/login");
});

// DELETE URLS //
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  let user_id = req.session.beaucoup;

  if (!user_id) {
    return res.status(402).send("Not logged in");
  }

  if (!urlDatabase.hasOwnProperty(id)) {
    return res.status(400).send("this id does not exist");
  }

  if (!urlsForUser(user_id)) {
    return res.status(401).send("You do not own this id");
  }

  delete urlDatabase[id];
  return res.redirect("/urls");
});

// EDIT EXISTING URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.editURL;

  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id] = { longURL: newURL };
  }

  return res.redirect("/urls");
});

// GET //

// ROOT PAGE //
app.get("/", (req, res) => {
  let user_id = req.session.beaucoup;

  if (!user_id) {
    return res.redirect("/login");
  }

  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let user_id = req.session.beaucoup;

  if (!user_id) {
    return res.status(403).send("Please Log in or Register First.");
  }

  const validLinks = urlsForUser(user_id);
  const templateVars = {
    urls: validLinks,
    user: user_id,
  };

  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.beaucoup;

  if (!user_id) {
    return res.redirect("/login");
  }

  const templateVars = {
    urls: urlDatabase,
    user: user_id,
  };

  return res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let user_id = req.session.beaucoup;

  if (user_id) {
    return res.redirect("/urls");
  }

  if (!user_id) {
    user_id = null;
  }

  const templateVars = {
    urls: urlDatabase,
    user: user_id,
  };

  return res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let user_id = req.session.beaucoup;

  if (user_id) {
    return res.redirect("/urls");
  }

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

  if (!urlDatabase.hasOwnProperty(id)) {
    return res.status(400).send("this id does not exist");
  }

  const longURL = urlDatabase[id].longURL;

  return res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// SHOW SHORT URLS //

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  let user_id = req.session.beaucoup;

  if (!user_id) {
    return res.status(400).send("Please log in.");
  }

  if (!urlsForUser(user_id)) {
    return res.status(403).send("You do not own this link");
  }

  const templateVars = {
    user: user_id,
    id: id,
    urls: urlDatabase[id],
  };

  return res.render("urls_show", templateVars);
});

app.get("*", (req, res) => {
  return res.render("404");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
