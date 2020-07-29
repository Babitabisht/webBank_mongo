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
      fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        accountsData = JSON.parse(jsonString);
      });
      let userDetailFromMongo = await userAccount.getUserAccount(
        req.mySession.username
      );
      let data = {
        username: req.mySession.username,
      };
      if (userDetailFromMongo.savings != undefined)
        data["alreadyHaveSavingsAccount"] = "disabled";
      if (userDetailFromMongo.savings != undefined)
        data["alreadyHaveChequingAccount"] = "disabled";
      res.render("account-type", data);
});

/* post endpoint */
router.post("/", sessionChecker, async (req, res) => {
  let accountNumbers = [];
  let userInfo = await userAccount.getUserAccount(req.mySession.username);
  if (userInfo.chequing != undefined) accountNumbers.push(userInfo.chequing);
  if (userInfo.savings != undefined) accountNumbers.push(userInfo.savings);
  let isDisable =
    userInfo.hasOwnProperty("chequing") && userInfo.hasOwnProperty("savings");

  let accountNumber;
  let db = mongoUtil.getDb();
  let { accountType } = req.body;

      if (accountType == "chequing") {
        if (userInfo.chequing != undefined || "chequing" in userInfo) {
          let data = {
            msg: `Account type ${req.body.accountType} already exist`,
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

            accountsData = JSON.parse(jsonString);
            // let strLength = accountsData.length;
            let numZero = "";
            let accountNumber;
            totalAccounts = Object.keys(accountsData).length;
            str = totalAccounts.toString();
            str.length < 7
              ? (numZero = "0".repeat(7 - str.length))
              : (numZero = numZero);
            accountNumber = numZero.concat(totalAccounts);
            accountsData[accountNumber] = {
              accountType: req.body.accountType,
              accountBalance: 0,
            };
            accountsData.lastID = accountNumber;
            userInfo.chequingAccount = accountNumber;

            db.collection("client")
              .findOne({ username: userInfo.username })
              .then((client) => {
                if (client == null) {
                  let client = {
                    username: userInfo.username,
                    chequing: accountNumber,
                  };
                  return db.collection("client").insertOne(client);
                } else {
                  let chequingAccount = { chequing: accountNumber };
                  return db
                    .collection("client")
                    .updateOne(
                      { username: userInfo.username },
                      { $set: chequingAccount }
                    );
                }
              })
              .then((result) => {
                return userAccount.getUserAccount(req.mySession.username);
              })
              .then((userInfo) => {
                let accountNumbers = [];
                if (userInfo.chequing != undefined)
                  accountNumbers.push(userInfo.chequing);
                if (userInfo.savings != undefined)
                  accountNumbers.push(userInfo.savings);

                fs.writeFile(
                  "./accounts.json",
                  JSON.stringify(accountsData),
                  (err) => {
                    if (err) console.log("Error writing file:", err);
                  }
                );

                let data = {
                  msg: `Account type ${req.body.accountType} with account number ${accountNumber} is created`,
                  username: req.mySession.username,
                  accountNumbers: accountNumbers,
                };
                let isDisable =
                  userInfo.hasOwnProperty("chequing") &&
                  userInfo.hasOwnProperty("savings");

                if (isDisable == true) data["isDisable"] = "disabled";
                res.render("home", data);
              });
          });
        }
      } else {
        if (
          userInfo.savings != undefined ||
          "savings" in userInfo
        ) {
          let data = {
            msg: `Account type ${req.body.accountType} already exist`,
            username: req.mySession.username,
            accountNumbers: accountNumbers,
          };
          let isDisable =
            userInfo.hasOwnProperty("chequing") &&
            userInfo.hasOwnProperty("savings");

          if (isDisable == true) data["isDisable"] = "disabled";
          res.render("home", data);
        } else {
          fs.readFile("./accounts.json", "utf8", (err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }

            accountsData = JSON.parse(jsonString);
            // let strLength = accountsData.length;
            let numZero = "";
            let accountNumber;
            totalAccounts = Object.keys(accountsData).length;
            str = totalAccounts.toString();
            str.length < 7
              ? (numZero = "0".repeat(7 - str.length))
              : (numZero = numZero);
            accountNumber = numZero.concat(totalAccounts);
            accountsData[accountNumber] = {
              accountType: req.body.accountType,
              accountBalance: 0,
            };
            accountsData.lastID = accountNumber;
            userInfo.savings = accountNumber;
            db.collection("client")
              .findOne({ username: userInfo.username })
              .then((client) => {
                if (client == null) {
                  let client = {
                    username: userInfo.username,
                    savings: accountNumber,
                  };
                  return db.collection("client").insertOne(client);
                } else {
                  let savingsAccount = { savings: accountNumber };
                  return db
                    .collection("client")
                    .updateOne(
                      { username: userInfo.username },
                      { $set: savingsAccount }
                    );
                }
              })
              .then((result) => {
                return userAccount.getUserAccount(req.mySession.username);
              })
              .then((userInfo) => {
                let accountNumbers = [];

                if (userInfo.chequing != undefined)
                  accountNumbers.push(userInfo.chequing);
                if (userInfo.savings != undefined)
                  accountNumbers.push(userInfo.savings);
                fs.writeFile(
                  "./accounts.json",
                  JSON.stringify(accountsData),
                  (err) => {
                    if (err) console.log("Error writing file:", err);
                  }
                );
               
                let isDisable =
                  userInfo.hasOwnProperty("chequing") &&
                  userInfo.hasOwnProperty("savings");

                let data = {
                  msg: `Account type ${req.body.accountType} with account number ${accountNumber} is created`,
                  username: req.mySession.username,
                  accountNumbers: accountNumbers,
                };
                if (isDisable == true) data["isDisable"] = "disabled";
                res.render("home", data);
              });
          });
        }
      }
});

module.exports = router;
