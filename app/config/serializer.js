'use strict';

module.exports = (function() {
	App.ApplicationSerializer = DS.RESTSerializer.extend({
		primaryKey: '_id'
	});

	App.LiquorDetailSerializer = DS.RESTSerializer.extend({
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
	});

	App.EmailSubscriptionSerializer = DS.RESTSerializer.extend({
	  normalizePayload: function(type, payload) {
	  	console.log("normalizing subscription Payload");
	  	//console.log(payload);
	    var allSubs = [];

	    var emailSub = payload.emailSubscription;

    	var tempPriceSubs = emailSub.priceSubscriptions;
    	var tempStockSubs = emailSub.stockSubscriptions;
    	emailSub.id = emailSub._id;
    	emailSub.priceSubscriptions = [];
    	emailSub.stockSubscriptions = [];
    	var count = 1;
    	
    	if(tempPriceSubs){
	    	tempPriceSubs.forEach(function(sub) {
	    		sub.itemId = sub._id;
	    		sub.subscriptionType = 'price';
	    		sub._id = emailSub._id+"---prc---"+sub.itemId;
	    		count++;
	    		emailSub.priceSubscriptions.push(sub._id);
	    		allSubs.push(sub);
	    	});
	    }

    	if(tempStockSubs){
    		tempStockSubs.forEach(function(sub) {
    			sub.itemId = sub._id;
    			sub.subscriptionType = 'stock';
	    		sub._id = emailSub._id+"---stk---"+sub.itemId;
	    		count++;
	    		emailSub.stockSubscriptions.push(sub._id);
	    		allSubs.push(sub);
	    	});
    	}
    	
	    payload.subscriptions = allSubs;
	    return this._super(type, payload);
	  }
	});
}());