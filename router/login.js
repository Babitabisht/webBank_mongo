var express = require("express");
var router = express.Router();
let path = require("path");
let fs = require("fs");
const userAccount = require("../lib/userAccount");
var mongoUtil = require("../db/mongoUtil.js");

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", (req, res) => {
  fs.readFile("user.json", (err, data) => {
    if (err) throw err;
    let users = JSON.parse(data);
    let count = 0;
    for (key in users) {
      if (req.body.username == users[key].username) {
        if (req.body.password == users[key].password) {
          req.mySession.username = req.body.username;
          return res.json({
            statusCode: 1,
            msg: "Login Success",
            username: req.body.username,
          });
        } else {
          return res.json({ statusCode: 0, msg: "Invalid password" });
        }
      } else {
        if (count == Object.keys(users).length - 1) {
          return res.json({ statusCode: 0, msg: "Not a registered username" });
        }
      }
      count++;
    }
  });
});

module.exports = router;
