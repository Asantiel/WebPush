var express = require('express'),
    bodyParser = require('body-parser'),
    MongoClient = require("mongodb").MongoClient,
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
const MongoClientConnection = MongoClient.connect(connectionString).catch(r => console.log(r));

let app = express();
var jsonParser = bodyParser.json();

app.post("/subscribe", jsonParser, function (request, response) {
    if(!request.body) {
        return response.sendStatus(400);
    }
    let message;
    MongoClientConnection.then(function(db){
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
                    });
                });
            } else if (results.length>0) {
                message = "Подписка уже оформлена";
                response.json(message);
            } else {
                collection.insertOne(device, function(err, result){
                    if(err){ 
                        return console.log(err);
                    }
                    console.log(result.ops);
                    let xhr = new XMLHttpRequest();
                    let url = "https://iid.googleapis.com/iid/v1/" + 
                               request.body.AppInstanceToken + 
                               "/rel/topics/" +
                               request.body.subscribeId;
                    xhr.open('POST', url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Authorization', 'key= AAAA4uqYCxM:APA91bF7LEuHwG5-2obu_GJsJbMx0vtl_y-1ILsFGT8Isjpa1MQNykQ7YtICMKvDvzezzVnSbiB2POYqVJyqC9IZ7TDVCfXrniNnei8N3LcFzpsI2wrafPB2lHSUB9a0kqznK-E9GUdU');
                    xhr.send(); 
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState != 4) return;

                        if (xhr.status != 200) {
                            console.log( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
                        } else {
                            console.log( xhr.responseText ); // responseText -- текст ответа.
                        } 
                    };
                    message = "Подписка оформлена!";
                    response.json(message);
                });
            }
        });
    });
});

app.post("/unsubscribe", jsonParser, function(request, response){
    if(!request.body) {
        return response.sendStatus(400);
    }
    let message;
    MongoClientConnection.then(function(db){
        // взаимодействие с базой данных
        let collection = db.collection("devices");
        let device = {token:request.body.AppInstanceToken, id: request.body.subscribeId};
        collection.find(device).toArray()
        .then(function(results){
            if (results.length == 0) {
                message = "У вас не было подписки на эту тему!";
                response.json(message);
            }
            else {
                collection.deleteMany(device, function(err, result){
                    if (err){
                        console.log(err);
                    }
                    message = "Подписка была удалена!";
                    response.json(message);
                });
            }
        });
    }).catch(err=>console.log(err));
});

module.exports = app;