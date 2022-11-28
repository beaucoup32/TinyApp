const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set view engine to ejs
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//use res.render to load up ejs view file
app.get("/", (req, res) => {
  templateVars = {
    main: 'Drip Drop'
  }

  res.render('dripDrop', templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };

  res.render('urls_index', templateVars);
});

app.get("/about", (req, res) => {
  res.render('pages/about');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/dripDrop', (req, res) => {
  templateVars = {
    main: 'Drip Drop'
  }

  res.render('dripDrop', templateVars);
});

app.get('*', (req, res) => {
  res.render('404');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});