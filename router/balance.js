var express = require("express");
var router = express.Router();
let path = require("path");
let fs = require("fs");
const userAccount = require("../lib/userAccount");
var mongoUtil = require("../db/mongoUtil.js");

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.mySession.username) {
    next();
  } else {
    res.render("login");
  }
};

/* get endpoints  */
router.get("/", sessionChecker, async (req, res) => {
  let accountNumbers = [];
  let userInfo = await userAccount.getUserAccount(req.mySession.username);
  if (userInfo.chequing != undefined) accountNumbers.push(userInfo.chequing);
  if (userInfo.savings != undefined) accountNumbers.push(userInfo.savings);
  let isDisable =
    userInfo.hasOwnProperty("chequing") && userInfo.hasOwnProperty("savings");

  if (req.query.accountNumber == "0000000") {
    let data = {
      msg: "Account number is missing",
      username: req.mySession.username,
      accountNumbers: accountNumbers,
    };
    if (isDisable == true) data["isDisable"] = "disabled";
    res.render("home", data);
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
          if (key == req.query.accountNumber) accountInfo = accountsData[key];
        }
      }

      if (accountInfo == "" || accountInfo == undefined) {
        let data = {
          msg: "Invalid account number",
          username: req.mySession.username,
          accountNumbers: accountNumbers,
        };
        let isDisable =
          userInfo.hasOwnProperty("chequing") &&
          userInfo.hasOwnProperty("savings");

        if (isDisable == true) data["isDisable"] = "disabled";
        res.render("home", data);
      } else {
        accountsData.lastID = req.query.accountNumber;
        fs.writeFile("./accounts.json", JSON.stringify(accountsData), (err) => {
          if (err) console.log("Error writing file:", err);
        });
        let data = {
          balance: true,
          accountNumber: req.query.accountNumber,
          accountInfo: accountInfo,
          username: req.mySession.username,
          accountNumbers: accountNumbers,
        };
        let isDisable =
          userInfo.hasOwnProperty("chequing") &&
          userInfo.hasOwnProperty("savings");

        if (isDisable == true) data["isDisable"] = "disabled";
        res.render("home", data);
      }
    });
  }
});

module.exports = router;
