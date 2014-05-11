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
	var curDate = new Date();
	datastore.logRunEvent(collectionTarget, curDate);
	mocoapi.getAllLiquors(curDate, recordsToImport, collectionTarget, datastore.loadLiquorsIntoDB);
	res.send('importing underwayyyyy');
});

app.get('/inventory/:_id', function(req, res) {
	mocoapi.getInventoryForItem(req.param("_id"), function(result){
		res.json(result);
	});
});

app.get('/liquors', function(req, res) {
	var collectionTarget = req.query.db || liquorPricesCollection;
	if (req.query.topsales){
		datastore.getTopSales(collectionTarget, req.query.limit, function(result){
			res.json(result);
		});
	}else{
		datastore.getAllLiquors(collectionTarget, req.query.limit, req.query.category, req.query.parentcategory, req.query.searchString, req.query.mindiscount, function(result){
			res.json(result);
		});
	}
});

app.get('/addEmail/:_id/:email', function(req, res) {
	var collectionTarget = req.query.db || liquorPricesCollection;
	datastore.addEmailAlert(collectionTarget, req.param("_id"), req.param("email"), req.query.price, req.query.stock);
	res.send("adding email...");
});

app.get('/liquorDetails/:_id', function(req, res) {
	var collectionTarget = req.query.db || liquorPricesCollection;
	datastore.getLiquorById(collectionTarget, req.param("_id"), mocoapi.getInventoryForItem, function(result){
		res.json(result);
	});
});

app.get('/copycollection', function(req, res) {
	datastore.copyCollection(req.query.from, req.query.to);
	res.send("running...");
});


app.get('/updatesalefields', function(req, res) {
	var collectionTarget = req.query.db || 'temp';
	datastore.updateSaleFields(collectionTarget);
	res.send("running...");
});

app.get('/updatediscountfields', function(req, res) {
	var collectionTarget = req.query.db || 'temp';
	datastore.updateDiscountFields(collectionTarget);
	res.send("running...");
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});