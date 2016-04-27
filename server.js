var express = require("express");
var logger = require('morgan');
var app = express();

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/galaxy.html')
})
app.use("/",express.static("public"))
app.use("/imgs",express.static("public/imgs"))
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));

app.listen(3535)
