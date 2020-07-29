//Loads the express module
const express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let fs = require("fs");
//Creates our express server
const app = express();
const port = 3000;
const userAccount = require("./lib/userAccount");
//Loads the handlebars module
const exphbs = require("express-handlebars");
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
// app.engine("hbs", exphbs());
app.set("view engine", "hbs");
const keys = require("./config/keys");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Serves static files (we need it to import a css file)
app.use(express.static(__dirname + "/public"));

var mongoUtil = require("./db/mongoUtil.js");

/* Implementing client sessions */
var sessions = require("client-sessions");
app.use(
  sessions({
    cookieName: "mySession", // cookie name dictates the key name added to the request object
    secret: "blargadeeblargblarg", // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  })
);

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.mySession.username) {
    next();
  } else {
    res.render("login");
  }
};

mongoUtil.connectToServer(function (err, client) {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to mongodb");
  }
});

//Sets a basic route
app.get("/", (req, res) => {
  res.redirect("/login");
});


app.get("/unauthorised", (req, res) => {
  res.render("unauthorised");
});

/* 
  express router implementation
*/
const deposit = require("./router/deposit");
app.use("/deposit", deposit);

const withdrawal = require("./router/withdrawal");
app.use("/withdrawal", withdrawal);

const createAccount = require("./router/createAccount");
app.use("/createAccount", createAccount);

const home= require("./router/home");
app.use("/home", home)

const login = require("./router/login");
app.use("/login", login);

const logout = require("./router/logout");
app.use("/logout", logout);

const balance = require("./router/balance");
app.use("/balance", balance)


//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));
