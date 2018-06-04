var express = require('express'),
    MongoClient = require("mongodb").MongoClient;

var app = express();

app.use("/", require("./web/app"));
app.use("/api", require("./api/app"));

app.listen(3000, function(){
    console.log('Server listening on: 3000');
});