var moment = require('moment');
var request = require('request');
var fs = require('fs');
var mongo = require('mongodb');

var dbConnection;
var collections = {};
var emailTemplate = '';
var mongoUri = process.env.MONGOHQ_URL;
var mongoUri_BackupDB = process.env.MONGO_URL_BACKUPDB;

module.exports = {
	isEmptyObject: function(obj) {
		return !Object.keys(obj).length;
	},
	parseDate: function(input) { //Parses date in the format 12/17/2014 (MM/DD/YYYY)
		var parts = input.split('/');
		// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		return new Date(moment.utc([parts[2], parts[0]-1, parts[1]]).format()); // Note: months are 0-based
	},
	sendEmail: function(toEmail,subject,htmlBody){
		if (!htmlBody){
			return;
		}
		var payload = {
			"From" : "liquorprices@mailismagic.com",
			"To" : toEmail,
			"Subject" : subject,
			"Tag" : "Invitation",
			"HtmlBody" : htmlBody,
			"ReplyTo" : "liquorprices@mailismagic.com"
		};
		var options = {
			url: 'http://api.postmarkapp.com/email',
			method: 'POST',
			body: payload,
			json: true,
			headers: {
	        	'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY
	    	}
		};
	
		function requestCallback(error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("sent email");
			}
			else{
				console.log('ERROR SENDING EMAIL!');
				console.log(error);
				console.log("got response");
				console.log(response);
				console.log("body");
				console.log(body);
			}
		};
		request(options, requestCallback);
	},
	getEmailTemplate: function(callback){
		if (emailTemplate === ''){
			fs.readFile('./backend/emailTemplate.html', 'utf8', function (err,source) {
			  if (err) {
			    console.log(err);
			  }else {
			  	emailTemplate = source;
				callback(emailTemplate);
			  }
			});
		}else {
			callback(emailTemplate);
		}
	},
	backupDB: function(fromCollection){
		this.getCollection(fromCollection, function(sourceCollection) {
			sourceCollection.find().toArray(function(err, sourceResults){
				mongo.Db.connect(mongoUri_BackupDB, function (err, db) {
					if (err) {console.log("error connecting to db");}
					else {
						db.collection(fromCollection+'-'+(moment(new Date()).format('YYYYMMDD-HH:mm:ss:ZZ')), function(err, backupCollection) {
							if (err) {console.log("error opening collection");}
							else {
								for (var key in sourceResults){
									backupCollection.insert(sourceResults[key], {w:1}, function(err,rs) {
										if (err){
											console.log("error importing item");
											console.log(err);
										}
									});
								}
							}
						});
					}
				});
			});
		});
	},
	getCollection: function(name, callback){
		if (!dbConnection){
			openConnection(function(db){
				openCollection(db, name, callback);
			});
		} else if (collections[name]){
			callback(collections[name]);
		} else {
			openCollection(dbConnection, name, callback);
		}
	}
};

var openConnection = function(callback){
	console.log("connecting to mongo db");
	mongo.Db.connect(mongoUri, function (err, db) {
		console.log("connected to mongo db");
		if (!err) {
			dbConnection = db;
			dbConnection.on('close', function() {
				dbConnection = null; //Remove db connection
				collections = {}; //Remove collections
				// connection closed
			});
			callback(db);
		} else {
			console.log("error connecting to db");
		}
	});
};
var openCollection = function(db, name, callback){
	db.collection(name, function(err, collection) {
		if (err) {
			console.log("error opening collection: "+name);
		}
		else {
			console.log("accessing collection: "+name);
			collections[name] = collection;
			callback(collections[name]);
		}
	});
};
