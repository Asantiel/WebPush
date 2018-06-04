var express = require("express"),
    bodyParser = require('body-parser'),
    MongoClient = require("mongodb").MongoClient;

let connectionString = "mongodb://localhost:27017/test";
let MongoClientConnection = MongoClient.connect(connectionString)
                            .catch(reason=>console.log(reason));

let urlencodedParser = bodyParser.urlencoded({extended: false});

let app = express();
app.get("/", function(request, response){
    MongoClientConnection.then(function(db){
        let collection = db.collection("devices");
        collection.distinct("token").then(function(results){
            response.render('admin', {devices: results});
        })
        .catch(reason=>console.log(reason));;
    });
});

app.get("/add", function(request, response){
    response.render('add');
});

app.post("/add", urlencodedParser, function(request, response){
    if(!request.body) {
        return response.sendStatus(400);
    }
    let message;
    MongoClientConnection.then(function(db){
        // взаимодействие с базой данных
        let collection = db.collection("themes");
        let theme = {title:request.body.title, description: request.body.description};
        collection.insertOne(theme, function(err, result){
            if(err){ 
                return console.log(err);
            }
            console.log(result.ops);
            message = "Тема успешно добавлена!";
            response.json(message);
        });
    });
});

module.exports = app;