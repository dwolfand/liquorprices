var moment = require('moment');
var request = require('request');

module.exports = {
	isEmptyObject: function(obj) {
		return !Object.keys(obj).length;
	},
	parseDate: function(input) {
		var parts = input.split('/');
		// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		return new Date(moment.utc([parts[2], parts[0]-1, parts[1]]).format()); // Note: months are 0-based
	},
	sendEmail: function(toEmail,subject,htmlBody){
		var payload = {
			"From" : "liquorprices@mailtothis.com",
			"To" : toEmail,
			"Subject" : subject,
			"Tag" : "Invitation",
			"HtmlBody" : htmlBody,
			"ReplyTo" : "liquorprices@mailtothis.com"
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
	}
};
