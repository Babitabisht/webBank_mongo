const MongoClient = require("mongodb").MongoClient;
var _db;
var database = "webBank";
const keys = require("../config/keys");


module.exports = {
  connectToServer: function (callback) {
    MongoClient.connect(
     keys.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      function (err, client) {
        if (err) {
          console.log("--this is error---", err);
        }
        _db = client.db(database.toString());
        return callback(err, _db);
      }
    );
  },

  getDb: function () {
    return _db;
  },
};
