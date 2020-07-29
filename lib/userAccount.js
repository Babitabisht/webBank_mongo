const mongoUtil = require("../db/mongoUtil");
const USER_NOT_FOUND = "user not found";
getUserAccount = async (username) => {
  return new Promise((resolve, reject) => {
    let db = mongoUtil.getDb();
    db.collection("client")
      .findOne({ username: username })
      .then((user) => {
        return user;
      })
      .then((user) => {
        if (user == null) {
          return USER_NOT_FOUND;
        } else {
          resolve(user);
        }
      })
      .then((user) => {
        if (user == USER_NOT_FOUND) {
          return db.collection("client").insertOne({ username: username });
        }
      })
      .then((user) => {
        resolve(user);
      })
      .catch((err) => {
        reject("Something went wrong!");
      });
  });
};

module.exports = {
  getUserAccount,
};
