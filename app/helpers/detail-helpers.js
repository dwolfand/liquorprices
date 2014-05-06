'use strict';

module.exports = (function() {
	Ember.Handlebars.helper('format-normalized-date', function(date) {
	  return date ? new moment.utc(date).format('MMMM Do YYYY') : null;
	});

	Ember.Handlebars.helper('format-discount', function(discount) {
	  return discount ? discount.toFixed(2)+"%" : null;
	});

	Ember.Handlebars.helper('format-dollar', function(input) {
	  return input ? "$"+input.toFixed(2) : null;
	});
}());