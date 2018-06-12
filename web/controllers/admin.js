var express = require("express"),
    bodyParser = require('body-parser'),
    MongoClient = require("mongodb").MongoClient,
    ObjectId = require('mongodb').ObjectID,
    admin = require('firebase-admin'),
    serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}); 

let connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
let MongoClientConnection = MongoClient.connect(connectionString)
                            .catch(reason=>console.log(reason));

let urlencodedParser = bodyParser.urlencoded({extended: false});

let app = express();

app.get("/", function(request, response){
    MongoClientConnection.then(function(db){
        let collection = db.collection("themes");
        collection.find().toArray()
        .then(function(result){
            response.render('admin', {themes: result});
        },
        function(error)
        {
            response.render('admin', {err: error});
        });
    });
});

app.get("/send", function(request, response){
    MongoClientConnection.then(function(db){
        let collection = db.collection("devices");
        collection.distinct("token").then(function(results){
            response.render('sendToDevice', {devices: results});
        })
        .catch(reason=>console.log(reason));;
    });
});

app.get("/delete/:id", function(request, response){
    MongoClientConnection.then(function(db){
        let collection = db.collection("themes");
        let theme = {"_id" : ObjectId(request.params.id)};
        collection.remove(theme, true);
        response.redirect('/admin');
    });
});

app.get("/edit/:id", function(request, response){
    MongoClientConnection.then(function(db){
        let collection = db.collection("themes");
        let theme = {"_id" : ObjectId(request.params.id)};
        collection.findOne(theme)
        .then(function(result){
            response.render('edit', {theme: result});
        });
    });
});

app.post("/edit/:id", urlencodedParser, function(request, response){
    MongoClientConnection.then(function(db){
        let collection = db.collection("themes");
        let theme = {"title": request.body.title, "description": request.body.description};
        collection.updateOne(
            { "_id" : ObjectId(request.params.id) }, //критерий выборки
            { $set : theme},  //параметр обновления
            function(err, result){
                if(err){
                    console.log(err);
                }
                response.redirect("/admin");
            }
        );
    });
});

app.get("/sendmultiple/:id", function(request, response){
    MongoClientConnection.then(function(db){
        db.collection("themes").findOne({"_id" : ObjectId(request.params.id)})
        .then(function(result){
            response.render('sendToTopic', {topicToSend: result});
        });
    });
});

app.post("/sendmultiple", urlencodedParser, function(request, response){
    let topic = "/topics/" + request.body.id;
    let message = {
        "topic": topic,
        "webpush":{
            "notification": {
                "title": request.body.title + "-" + request.body.themetitle,
                "body": request.body.description,
                "icon": "images/img_557022.png"
            }
        }
    };
    admin.messaging().send(message)
    .then((responsestr) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', responsestr);
      response.redirect('/admin');
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      response.json(error);
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
            message = "Тема '" + theme.title + "' успешно добавлена!";
            response.render('add', {message: message});
        });
    });
});

module.exports = app;