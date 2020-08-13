var express = require("express");
var router = express.Router();
let path = require("path");
let fs = require("fs");
const userAccount = require("../lib/userAccount");
var mongoUtil = require("../db/mongoUtil.js");

router.get("/", (req, res) => {
  res.render("register");
});

router.post("/", (req, res) => {
  let db = mongoUtil.getDb();
  let { firstName, lastName, username, email, password, cpassword } = req.body;
  let client = { ...req.body };
  delete client["cpassword"]; 

  if (password != cpassword) {
    res.render("register", { msg: "password mismatched" });
  } else {
    db.collection("user")
      .findOne({ email: email })
      .then((result) => {
        return result;
      })
      .then((alreadyRegisteredEmail) => {
        if (alreadyRegisteredEmail != null) {
          return Promise.reject("Email already registered");
        } else {
          return null;
        }
      })
      .then(() => {
        return db.collection("user").findOne({ username: username });
      })
      .then((alreadyRegisteredUsername) => {
        if (alreadyRegisteredUsername != null) {
          return Promise.reject("Username already exists");
        } else {
          return null;
        }
      })
      .then(() => {
        return db.collection("user").insertOne(client);
      })
      .then((result) => {
       
        res.render("login", {
          msg: "You are now registered and can Sign In",
        });
      })
      .catch((err) => {
        res.render("register", { msg: err });
        console.log("--err---", err);
      });
  }
});

module.exports = router;
