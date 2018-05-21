var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    request = require('request'),
    exphbs = require('express-handlebars'),
    MongoClient = require("mongodb").MongoClient;

let connectionString = "mongodb://localhost:27017/test";

var app = express();
//var urlencodedParser = bodyParser.urlencoded({extended: false});
var jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/public'));
app.set("view engine", "hbs");
app.set("views", __dirname+"\\public\\views");

const hbs = exphbs.create({
    extname      :'hbs',
    layoutsDir   : __dirname+"\\public\\views\\layouts",
    defaultLayout: 'main',
    partialsDir  : __dirname+"\\public\\views\\partials"
});

app.engine('hbs', hbs.engine);

app.get("/", function(request, response){
    response.render('index');
});

app.get("/admin", function(request, response){
    MongoClient.connect(connectionString, function(err, db){
        if(err){
            return console.log(err);
        }

        let collection = db.collection("devices");
        collection.distinct("token").then(function(results){
            response.render('admin', {devices: results});
        });
        
    });
});

app.post("/subscribe", jsonParser, function (request, response) {
    if(!request.body) {
        return response.sendStatus(400);
    }
    let message;
    MongoClient.connect(connectionString, function(err, db){
        if(err){
            return console.log(err);
        }
        // взаимодействие с базой данных
        let collection = db.collection("devices");
        let device = {token:request.body.AppInstanceToken, id: request.body.subscribeId};
        collection.find(device).toArray()
        .then(function(results){
            if(results.length>1){
                collection.deleteMany(device, function(err, result){
                    if(err){
                        console.log(err);                        
                    }
                    message = "Обнаружена более, чем одна подписка на данную тему от данного устройства. Они будут удалены, кроме одной."
                    //тупо, но работает
                    collection.insertOne(device, function(err, result){
                        if(err){ 
                            return console.log(err);
                        }
                        console.log(result.ops);
                        response.json(message);
                        db.close();
                    });
                });
            } else if (results.length>0) {
                message = "Подписка уже оформлена";
                response.json(message);
                db.close();
            } else {
                collection.insertOne(device, function(err, result){
                    if(err){ 
                        return console.log(err);
                    }
                    console.log(result.ops);
                    message = "Подписка оформлена!";
                    response.json(message);
                    db.close();
                });
            }
        });
    });
});

app.post("/deleteToken", jsonParser, function(request, response){
    if(!request.body) {
        return response.sendStatus(400);
    }
    let message;
    MongoClient.connect(connectionString, function(err, db){
        if(err){
            return console.log(err);
        }
        // взаимодействие с базой данных
        let collection = db.collection("devices");
        let device = {token:request.body.AppInstanceToken, id: request.body.subscribeId};
        collection.find(device).toArray()
        .then(function(results){
            if (results.length == 0) {
                message = "У вас не было подписки на эту тему!";
                response.json(message);
                db.close();
            }
            else {
                collection.deleteMany(device, function(err, result){
                    if (err){
                        console.log(err);
                    }
                    message = "Подписка была удалена!";
                    response.json(message);
                    db.close();
                });
            }
        });
    });
});

app.post("/send", jsonParser, function(request, response){});

app.listen(3000, function(){
    console.log('Server listening on: 3000');
});