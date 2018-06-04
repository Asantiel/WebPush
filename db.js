var MongoClient = require("mongodb").MongoClient;

class DB {
    constructor() {
        this.db = null;
    }
    connect(uri) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.db) {
                //Already connected
                resolve();
            }
            else {
                let __this = _this;
                MongoClient.connect(uri)
                    .then(function (database) {
                        __this.db = database;
                        resolve();
                    }, function (err) {
                        console.log("Error connecting: " + err.message);
                        reject(err.message);
                    });
            }
        });
    }
    close() {
        // Close the database connection. This if the connection isn't open
        // then just ignore, if closing a connection fails then log the fact
        // but then move on. This method returns nothing – the caller can fire
        // and forget.
        if (this.db) {
            this.db.close()
                .then(function () { }, function (error) {
                    console.log("Failed to close the database: " + error.message);
                });
        }
    }
}

module.exports = DB;
