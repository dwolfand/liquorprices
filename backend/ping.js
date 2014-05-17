var request = require('request');

module.exports = {
	runImportScript: function(){
		//once the db load goes through, call the same method to run in the next day
		setTimeout(this.runImportScript, 21600000); //6 hours = 21600000 MS
		triggerDBLoad(function(response){
			console.log("syncing db"+response);
		});
	},
	runPingScript: function(){
		//once the db load goes through, call the same method to run in the next day
		setTimeout(this.runPingScript, 1200000); //20 minutes = 1200000 MS
		//ping the server home page to make sure heroku is awake
		wakeUpServer(function(response){
			console.log("Woke Up Server");
		});
	}
};

var pingURL = function(requestURL, callback){
	request({url: requestURL, method: 'GET'}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("got response from server for url: "+requestURL);
			//console.log(body);	
			callback(body);
		}
		else{
			console.log('ERROR!');
			console.log(error);
		}
	});
};

var wakeUpServer = function(callback){
	pingURL('http://liquorprices.herokuapp.com/', function(response){
		callback(response);
	});
};

var triggerDBLoad = function(callback){
	pingURL('http://liquorprices.herokuapp.com/loaddb?num=0', function(response){
		callback(response);
	});
};


