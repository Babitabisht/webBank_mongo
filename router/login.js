var express = require("express");
var router = express.Router();
let path = require("path");
let fs = require("fs");
const userAccount = require("../lib/userAccount");
var mongoUtil = require("../db/mongoUtil.js");

router.get("/", (req, res) => {
  console.log("--in get login--")
  res.render("login");
});

router.post("/", (req, res) => {
 let db = mongoUtil.getDb();
 let {username,password}=req.body;
 db.collection("client2").findOne({username:username}).then(result=>{
   if(result!=null){
     if(result.password == password){
        // req.mySession.username = req.body.username;
        // res.render("home",{username:result.username});
         req.mySession.username = req.body.username;
         /* return res.json({
           statusCode: 1,
           msg: "Login Success",
           username: req.body.username,
         }); */
         res.render("home", { username: req.body.username });
     }else{
        // return res.json({ statusCode: 0, msg: "Username or password not valid"});
         res.render("login", { msg: "Username or password not valid" });
     }
   }else{
     console.log("--here--")
         res.render("login", { msg: "Not a registered username" });
        //  return res.json({ statusCode: 0, msg: "Not a registered username" });
   }
  
 }) 


});

module.exports = router;
