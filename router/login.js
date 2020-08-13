var express = require("express");
var router = express.Router();
var mongoUtil = require("../db/mongoUtil.js");

router.get("/", (req, res) => {
  console.log("--in get login--")
  res.render("login");
});

router.post("/", (req, res) => {
 let db = mongoUtil.getDb();
 let {username,password}=req.body;
 db.collection("user").findOne({username:username}).then(result=>{
   if(result!=null){
     if(result.password == password){
         req.mySession.username = req.body.username;
         res.render("home", { username: req.body.username });
     }else{
         res.render("login", { msg: "Username or password not valid" });
     }
   }else{
         res.render("login", { msg: "Not a registered username" });
   }
  
 })
});

module.exports = router;
