var express = require("express"),
    MongoClient = require("mongodb").MongoClient;

let app = express();

app.use("/admin", require("./admin"));
app.use("/push", require("./push"));

app.get("/", function(request, response){
    let connectionString = "mongodb://localhost:27017/test";
    let MongoClientConnection = MongoClient.connect(connectionString)
                            .catch(reason=>console.log(reason));
    MongoClientConnection.then(function(db){
        let collection = db.collection("themes");
        collection.find().toArray()
        .then(function(results){
            response.render('index', {themes: results});
        });
    });
});

module.exports=app;