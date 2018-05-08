var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    request = require('request'),
    exphbs = require('express-handlebars');

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

app.get("/", function(request, response){
    response.render("index.hbs");
});

app.post("/subscribe", jsonParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);
    fs.writeFile("token.txt", request.body.AppInstanceToken, function(err){
        if (err){
            console.log(error);
        }
        return request.body.AppInstanceToken;
    });
    //response.send(`${request.body.title} - ${request.body.description}`);
    response.sendStatus(200);
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

app.listen(3000);

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