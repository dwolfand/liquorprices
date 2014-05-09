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
	    var allInventory = [];

	    var liquorDetail = payload.liquorDetail;

    	var tempSales = liquorDetail.sale;
    	var tempErrors = liquorDetail.errors;
    	var tempInventory = liquorDetail.inventory;
    	liquorDetail.id = liquorDetail._id;
    	liquorDetail.sales = [];
    	liquorDetail.liquorerrors = [];
    	liquorDetail.inventory = [];
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

    	if(tempInventory){
    		tempInventory.forEach(function(inventory) {
	    		inventory._id = liquorDetail._id+"-"+count;
	    		count++;
	    		liquorDetail.inventory.push(inventory._id);
	    		allInventory.push(inventory);
	    	});
    	}
    	
	    payload.sales = allSales;
	    payload.liquorErrors = allErrors;
	    payload.inventory = allInventory;
	    return this._super(type, payload);
	  }
	})
}());