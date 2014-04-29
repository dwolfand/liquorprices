//Express server
var express = require("express");
var app = express();

//included libraries
var logfmt = require("logfmt");
var request = require('request');
var mongo = require('mongodb');
var moment = require('moment');

//Custom Libraries
var tools = require('./tools');
var datastore = require('./datastore');
var mocoapi = require('./mocoapi');

		
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('nothing to see here');
});

app.get('/loaddb', function(req, res) {
	
	mocoapi.getAllLiquors(new Date(), datastore.loadLiquorsIntoDB);

	res.send('importing underwayyyyy');
   
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});