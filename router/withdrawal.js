var express = require("express");
var router = express.Router();
let path = require("path");
let fs = require("fs");
const userAccount = require("../lib/userAccount");
var mongoUtil = require("../db/mongoUtil.js");
const roundOf = require("../lib/roundOf");

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.mySession.username) {
    next();
  } else {
    res.render("login");
  }
};

/* 
    get endpoint for withdrawal
 */
router.get("/", sessionChecker, (req, res) => {
  if (req.query.accountNumber == "0000000") {
    res.render("home", {
      msg: "Account number is missing",
      username: req.mySession.username,
    });
  } else {
    fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
      let accountsData = JSON.parse(jsonString);
      let accountInfo;
      for (var key in accountsData) {
        if (accountsData.hasOwnProperty(key)) {
          if (key == req.query.accountNumber) {
            accountInfo = accountsData[key];
          }
        }
      }
      if (accountInfo == "" || accountInfo == undefined) {
        res.render("home", {
          msg: "Invalid account number",
          username: req.mySession.username,
        });
      } else {
        res.render("withdrawal", {
          accountNumber: req.query.accountNumber,
          username: req.mySession.username,
        });
      }
    });
  }
});

/* 
    post endpoint for withdrawal
*/
router.post("/", sessionChecker, (req, res) => {
  let { withdrawalAmount, accountNumber } = req.body;
  fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    let accountsData = JSON.parse(jsonString);
    let accountInfo;
    for (var key in accountsData) {
      if (accountsData.hasOwnProperty(key)) {
        if (key == req.body.accountNumber) {
          accountInfo = accountsData[key];
          if (
            parseFloat(withdrawalAmount) >
            parseFloat(accountInfo.accountBalance)
          ) {
            res.render(`withdrawal`, {
              accountNumber: accountNumber,
              msg: "Insufficient Funds",
              username: req.mySession.username,
            });
            return;
          }
          accountInfo.accountBalance = roundOf.roundToTwo(
            parseFloat(accountInfo.accountBalance) -
              parseFloat(withdrawalAmount)
          );
        }
      }
    }
    accountsData.lastID = req.body.accountNumber;
    fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
      if (err) console.log("Error writing file:", err);
    });
    res.redirect(`balance?accountNumber=${accountNumber}`);
  });
});

module.exports = router;
