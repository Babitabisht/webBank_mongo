var express = require("express");
var router = express.Router();


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.mySession.username) {
    next();
  } else {
    res.render("login");
  }
};

router.get("/", sessionChecker, (req, res) => {
  req.mySession.reset();
  res.render("login");
});



module.exports = router;