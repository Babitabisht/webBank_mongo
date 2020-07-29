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

router.get("/", sessionChecker, async (req, res) => {
  try {
    let accountsData;
    let accountNumbers = [];
    let userInfo = await userAccount.getUserAccount(req.mySession.username);
    if (userInfo.chequing != undefined) accountNumbers.push(userInfo.chequing);
    if (userInfo.savings != undefined) accountNumbers.push(userInfo.savings);
    let isDisable =
      userInfo.hasOwnProperty("chequing") && userInfo.hasOwnProperty("savings");

    let data = {
      username: req.mySession.username,
      accountNumbers: accountNumbers,
    };
    if (isDisable == true) data["isDisable"] = "disabled";
    res.render("home", data);
  } catch (error) {
    console.log("--error---", error);
    res.render("home", {
      username: req.mySession.username,
      accountNumbers: [],
    });
  }
});

router.post("/", sessionChecker, async (req, res) => {
  let { accountNumber, serviceType } = req.body;
  let strLength;
  accountNumber == undefined
    ? (strLength = 0)
    : (strLength = accountNumber.length);
  let numZero;
  let modifiedAccountNumber;
  strLength < 7 ? (numZero = "0".repeat(7 - strLength)) : (numZero = numZero);
  strLength < 7
    ? (modifiedAccountNumber = numZero.concat(accountNumber))
    : (modifiedAccountNumber = accountNumber);

  let userDetailFromMongo = await userAccount.getUserAccount(
    req.mySession.username
  );

  let data = {
    accountNumber: modifiedAccountNumber,
    username: req.mySession.username,
  };
  if (userDetailFromMongo.savings != undefined)
    data["alreadyHaveSavingsAccount"] = "disabled";
  if (userDetailFromMongo.chequing != undefined)
    data["alreadyHaveChequingAccount"] = "disabled";
  switch (serviceType) {
    case "balance":
      res.redirect(`/balance?accountNumber=${modifiedAccountNumber}`);
      break;
    case "deposit":
      res.redirect(`/deposit?accountNumber=${modifiedAccountNumber}`);
      break;
    case "withdrawal":
      res.redirect(`/withdrawal?accountNumber=${modifiedAccountNumber}`);
      break;
    case "openAccount":
      res.render("createAccount", data);
      break;
  }
});

module.exports = router;
