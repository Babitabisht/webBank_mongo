var express = require("express");
var router = express.Router();
let path = require("path");
let fs = require("fs");
const userAccount = require("../lib/userAccount");
var mongoUtil = require("../db/mongoUtil.js");
const roundOf= require("../lib/roundOf");
// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.mySession.username) {
    next();
  } else {
    res.render("login");
  }
};

/*  
get endpoint for deposit
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
        res.render("deposit", {
          accountNumber: req.query.accountNumber,
          username: req.mySession.username,
        });
      }
    });
  }
});

/* 
    post endpoint for deposit
*/
router.post("/", sessionChecker, async (req, res) => {
  let accountNumbers = [];
  let userInfo = await userAccount.getUserAccount(req.mySession.username);
  if (userInfo.chequing != undefined) accountNumbers.push(userInfo.chequing);
  if (userInfo.savings != undefined) accountNumbers.push(userInfo.savings);

  let { depositAmount, accountNumber } = req.body;
  let isDisable =
    userInfo.hasOwnProperty("chequing") && userInfo.hasOwnProperty("savings");

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
          accountInfo.accountBalance = roundOf.roundToTwo(
            parseFloat(accountInfo.accountBalance) + parseFloat(depositAmount)
          );
          // accountInfo = accountsData[key];
        }
      }
    }
    if (accountInfo == "" || accountInfo == undefined) {
      let data = {
        msg: "Invalid account number",
        username: req.mySession.username,
        accountNumbers: accountNumbers,
      };
      if (isDisable == true) data["isDisable"] = "disabled";
      res.render("home", data);
    } else {
      accountsData.lastID = req.body.accountNumber;
      fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
        if (err) console.log("Error writing file:", err);
      });
      let data = {
        balance: true,
        accountNumber: accountNumber,
        accountInfo: accountInfo,
        username: req.mySession.username,
        accountNumbers: accountNumbers,
      };
      if (isDisable == true) data["isDisable"] = "disabled";

      res.render("home", data);
    }
  });
});





module.exports = router;
