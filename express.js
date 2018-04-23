var express = require('express');
var app = express();
app.express = express;
app.enable("trust proxy");
module.exports = app;