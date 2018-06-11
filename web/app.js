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
    defaultLayout: 'main',
    helpers:{
    // Function to do basic mathematical operation in handlebar
        math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        }
    }
});
// Routes
// ------
app.engine('hbs', hbs.engine);

app.use(require("./controllers"));

// Exports
// -------

module.exports = app;
