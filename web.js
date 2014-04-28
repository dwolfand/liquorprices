// web.js
var express = require("express");
var logfmt = require("logfmt");
var request = require('request');
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	
var payload = {
	'displaycnt':10,
	'keyword':'',
	'pricemin':'0',
	'pricemax':'1000',
	'category':'null',
	'categorymain':'',
	'size':'null',
	'isSale':'0',
	'sortid':'longdescription'
	},
	options = {
    url: 'http://www2.montgomerycountymd.gov/dlcsearch/SearchSupportService.asmx/GetSearchData',
	method: 'POST',
	proxy : 'http://127.0.0.1:8888',
	body: payload,
	json: true,
    headers: {
        'User-Agent': 'request'
		}
	};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
		console.log('success');
        console.log(body.d);
		var size = 0, key;
		for (key in body.d) {
			size++;
		}
		console.log(size);
		res.send(body.d);
    }
	else{
		console.log('ERROR!');
		console.log(error);
	}
};

request(options, callback);
  // res.send('hello');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});