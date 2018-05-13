var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    request = require('request'),
    exphbs = require('express-handlebars'),
    MongoClient = require("mongodb").MongoClient;

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
    response.render('admin');
});

app.post("/subscribe", jsonParser, function (request, response) {
    if(!request.body) {
        return response.sendStatus(400);
    }
    MongoClient.connect("mongodb://localhost:27017/test", function(err, db){
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
                    db.close();
                });
            } else if (results.length>0) {
                db.close();
            } else {
                collection.insertOne(device, function(err, result){
                    if(err){ 
                        return console.log(err);
                    }
                    console.log(result.ops);
                    db.close();
                });
            }
        });
    });
});

app.post("/send", jsonParser, function(request, response){
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);
    let serverKey = getAccessToken();
    let clientToken= fs.readFileSync("token.txt", "utf8");
    let options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        headers:{
            'Autorization': 'key='+serverKey,
        },
        json:{
            'to':clientToken,
            'data':{
                'title':'Hello мир'
            }
        }
    };
    request.post(options, function optionCallback(err, httpResponse, body){
        if(err){
            return console.error('ERROR - FIREBASE POST failed:', err);
        }
    });
});

app.listen(3000, function(){
    console.log('Server listening on: 3000');
});

function getAccessToken() {
    return new Promise(function(resolve, reject) {
        var key = require('./service-account.json');
        var jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function(err, tokens) {
            if (err) {
            reject(err);
            return;
            }
            resolve(tokens.access_token);
        });
    });
  }