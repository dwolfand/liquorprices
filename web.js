// web.js
var express = require("express");
var logfmt = require("logfmt");
var request = require('request');
var pg = require('pg.js');
var mongo = require('mongodb');
var app = express();
var mongoUri = process.env.MONGOHQ_URL || 'mongodb://david:liquorpricespass@localhost:10062/liquorprices';
		
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	// mongo.Db.connect(mongoUri, function (err, db) {
		// db.collection('liquorprices', function(er, collection) {
			
		// });
	// });
	res.send('nothing right now');
});

app.get('/loaddb', function(req, res) {

	var payload = {
		'displaycnt':0,
		'keyword':'',
		'pricemin':'0',
		'pricemax':'10000',
		'category':'null',
		'categorymain':'',
		'size':'null',
		'isSale':'0',
		'sortid':'longdescription'
		};
	var options = {
		url: 'http://www2.montgomerycountymd.gov/dlcsearch/SearchSupportService.asmx/GetSearchData',
		method: 'POST',
		//proxy : 'http://127.0.0.1:8888',
		body: payload,
		json: true
		};

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('success');
			//console.log(body.d);
			var size = 0, key;
			
			mongo.Db.connect(mongoUri, function (err, db) {
				db.collection('liquorprices', function(er, collection) {
					collection.remove({},function(err, removed){
						for (key in body.d) {
							size++;
							collection.insert(body.d[key], {w:1}, function(er,rs) {
								//console.log('saved this one');
								//console.log(body.d[key]);
							});
						}
						res.send('done saving '+size+' items into the db');
					});
				});
			});
			
		}
		else{
			console.log('ERROR!');
			console.log(error);
		}
	};

	request(options, callback);
   
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

