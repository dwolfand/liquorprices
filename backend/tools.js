var moment = require('moment');

module.exports = {
	isEmptyObject: function(obj) {
		return !Object.keys(obj).length;
	},
	parseDate: function(input) {
		var parts = input.split('/');
		// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		return new Date(moment.utc([parts[2], parts[0]-1, parts[1]]).format()); // Note: months are 0-based
	}
};
