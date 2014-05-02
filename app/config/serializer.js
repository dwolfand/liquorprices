'use strict';

module.exports = (function() {
	App.ApplicationSerializer = DS.RESTSerializer.extend({
		primaryKey: '_id'
	});

	//Ember.Inflector.inflector.irregular('sale', 'sale');

	App.LiquorSerializer = DS.RESTSerializer.extend({
	  // extractSingle: function(store, type, oldPayload) {
	  // 	console.log("extractSingle");
	  // 	console.log(oldPayload);

	  // 	this._super(store, type, oldPayload);
	  // },
	  // extractArray: function(store, type, payload, id, requestType) {
	  // 	// console.log("extractArray");
	  // 	// console.log(id);
	  // 	// console.log(payload);
	  // 	this._super(store, type, payload, id, requestType);
	  // },
	  normalizePayload: function(type, payload) {
	  	console.log("normalizing liquors Payload");
	  	//console.log(payload);
	    var allSales = [];

	    payload.liquors.forEach(function(liquor) {
	    	var tempSales = liquor.sale;
	    	liquor.id = liquor._id;
	    	liquor.sale = [];
	    	var count = 1;
	    	tempSales.forEach(function(sale) {
	    		sale._id = liquor._id+"-"+count;
	    		count++;
	    		liquor.sale.push(sale._id);
	    		allSales.push(sale);
	    	});
	    });
	    payload.sales = allSales;
	    return this._super(type, payload);
	  }
	})
}());