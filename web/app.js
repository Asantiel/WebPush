var express = require('express'),
    bodyParser = require('body-parser'),
    exphbs = require('express-handlebars');

// Web Express App
// ---------------

var app = express();

app.set("view engine", "hbs");
app.set("views", __dirname+"\\views");

app.use(bodyParser.json());
app.use(express.static(__dirname+"\\public"));

const hbs = exphbs.create({
    extname      :'hbs',
    defaultLayout: 'main'
});
// Routes
// ------
app.engine('hbs', hbs.engine);

app.use(require("./controllers"));

// Exports
// -------

module.exports = app;
