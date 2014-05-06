'use strict';

module.exports = (function() {
	App.ApplicationSerializer = DS.RESTSerializer.extend({
		primaryKey: '_id'
	});

	App.LiquorDetailSerializer = DS.RESTSerializer.extend({
	  // extractSingle: function(store, type, oldPayload) {
	  // 	console.log("extractSingle");
	  // 	console.log(oldPayload);

	  // 	this._super(store, type, oldPayload);
	  // },
	  // extractArray: function(store, type, payload, id, requestType) {
	  // 	 console.log("extractArray");
	  // 	// console.log(id);
	  // 	// console.log(payload);
	  // 	this._super(store, type, payload, id, requestType);
	  // },
	  normalizePayload: function(type, payload) {
	  	console.log("normalizing liquor Payload");
	  	//console.log(payload);
	    var allSales = [];
	    var allErrors = [];

	    var liquorDetail = payload.liquorDetail;

    	var tempSales = liquorDetail.sale;
    	var tempErrors = liquorDetail.errors;
    	liquorDetail.id = liquorDetail._id;
    	liquorDetail.sales = [];
    	liquorDetail.liquorerrors = [];
    	var count = 1;
    	
    	if(tempSales){
	    	tempSales.forEach(function(sale) {
	    		sale._id = liquorDetail._id+"-"+count;
	    		count++;
	    		liquorDetail.sales.push(sale._id);
	    		allSales.push(sale);
	    	});
	    }

    	if(tempErrors){
    		tempErrors.forEach(function(liquorError) {
	    		liquorError._id = liquorDetail._id+"-"+count;
	    		count++;
	    		liquorDetail.liquorerrors.push(liquorError._id);
	    		allErrors.push(liquorError);
	    	});
    	}
    	
	    payload.sales = allSales;
	    payload.liquorErrors = allErrors;
	    return this._super(type, payload);
	  }
	})
}());