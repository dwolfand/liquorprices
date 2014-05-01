//Express server
var express = require("express");
var app = express();

//included libraries
var logfmt = require("logfmt");
var request = require('request');
var mongo = require('mongodb');
var moment = require('moment');

//Custom Libraries
var tools = require('./backend/tools');
var datastore = require('./backend/datastore');
var mocoapi = require('./backend/mocoapi');

var liquorPricesCollection = process.env.LIQUOR_PRICES_COLLECTION_NAME || 'liquorpricesdev';
		
app.use(logfmt.requestLogger());

// app.get('/', function(req, res) {
	// res.send('nothing to see here');
// });

app.use(express.static(__dirname + '/public'));

app.get('/loaddb', function(req, res) {
	var recordsToImport = req.query.num || 20;
	var collectionTarget = req.query.db || liquorPricesCollection;
	mocoapi.getAllLiquors(new Date(), recordsToImport, collectionTarget, datastore.loadLiquorsIntoDB);
	res.send('importing underwayyyyy');
});

app.get('/finddiff', function(req, res) {
	datastore.findDiff(function(diff){
		res.send(diff.toString());
	});
});

app.get('/maxpercent', function(req, res) {
	var collectionTarget = req.query.db || liquorPricesCollection;
	datastore.maxPercent(req.query.percent, collectionTarget, function(result){
		res.json(result);
	});
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});