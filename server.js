var express = require('express');
 
var app = express();

app.use("/", require("./web/app"));
app.use("/api", require("./api/app"));

app.listen(80, function(){
    console.log('Server listening on: 80');
});