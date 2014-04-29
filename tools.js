module.exports = {
	isEmptyObject: function(obj) {
		return !Object.keys(obj).length;
	},
	parseDate: function(input) {
		var parts = input.split('/');
		// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		console.log(parts);
		console.log(input);
		return new Date(parts[2], parts[0]-1, parts[1]); // Note: months are 0-based
	}
};
