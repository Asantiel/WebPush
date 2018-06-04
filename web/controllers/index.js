var express = require("express");

let app = express();

app.use("/admin", require("./admin"));
app.use("/push", require("./push"));

app.get("/", function(request, response){
    response.render('index');
});

module.exports=app;