var mongo = require('mongodb');
var tools = require('./tools');

module.exports = {
    getAllLiquors: function(collectionTarget, limit, category, parentcategory, searchString, mindiscount, callback){
        tools.getCollection(collectionTarget, function(collection) {
        	query = {};
        	if (category){
        		query.category = {"$in":category.split(",")};
        	}
        	if (parentcategory){
        		query.parentcategory = {"$in":parentcategory.split(",")};
        	}
        	if (searchString){
        		query.longdescription = new RegExp('.*'+searchString+'.*', "i");
        	}
        	if (mindiscount){
        		query.discount = {"$gt":parseFloat(mindiscount)};
        	}
        	fields = {description: 1,
			  size: 1,
			  price: 1,
			  category: 1,
			  imgsrc: 1,
			  longdescription: 1,
			  status: 1,
			  cursaleprice: 1,
			  cursaleenddate: 1,
			  lastUpdated: 1,
			  createddate: 1,
			  parentcategory: 1,
			  discount: 1};
        	options = {};
        	if (limit && limit > 0){
        		options.limit = limit;
        	}
			collection.find(query,fields,options).toArray(function(err, results){
				callback({"liquors":results});
			});
        });
    },

    getLiquorById: function(collectionTarget, _id, inventoryFunction, callback){
        tools.getCollection(collectionTarget, function(collection) {
			collection.find({"_id":_id},{},{}).toArray(function(err, results){
				inventoryFunction(_id, function(inventoryResult){
					if (results[0]){
						var result = results[0];
						result.inventory = inventoryResult;
						callback({"liquorDetail":result});
					}else{
						console.log("Item does not exist: "+_id);
						callback({});
					}
				});
			});
        });
    },

    getSubscriptions: function(collectionTarget, email, callback){
    	emailSubscription = {_id:email};
    	fields = {size: 1, imgsrc: 1, longdescription: 1, parentcategory: 1};
        tools.getCollection(collectionTarget, function(collection) {
			collection.find({"priceEmails":email},fields,{}).toArray(function(err, priceResults){
				emailSubscription.priceSubscriptions = priceResults;
				collection.find({"stockEmails":email},fields,{}).toArray(function(err, stockResults){
					emailSubscription.stockSubscriptions = stockResults;
					callback({"emailSubscription":emailSubscription});
				});
			});
        });
    },

    removeSubscription: function(collectionTarget, identifier, callback){
    	var itemId = identifier.slice(identifier.indexOf("---")+9,identifier.length), 
    		subType = identifier.slice(identifier.indexOf("---")+3,identifier.indexOf("---")+6), 
    		email = identifier.slice(0,identifier.indexOf("---"));

		tools.getCollection(collectionTarget, function(collection) {
			if (subType === 'stk'){
				collection.update({_id:itemId}, {'$pull': {'stockEmails':email}}, {w: 1}, function(err, result) {					
					if (err){
						console.log("error removing subscription: "+identifier);
						console.log(err);
					}else{
						callback();
					}
				});
			}else if (subType === 'prc'){
				collection.update({_id:itemId}, {'$pull': {'priceEmails':email}}, {w: 1}, function(err, result) {
					if (err){
						console.log("error removing subscription: "+identifier);
						console.log(err);
					}else{
						callback();
					}
				});
			}
		});
    	
    },

    getTopSales: function(collectionTarget, limit, callback){
    	var returnResults = [];
    	query = {discount: {"$gt":0}};
		fields = {description: 1,
		  size: 1,
		  price: 1,
		  category: 1,
		  imgsrc: 1,
		  longdescription: 1,
		  status: 1,
		  cursaleprice: 1,
		  cursaleenddate: 1,
		  lastUpdated: 1,
		  createddate: 1,
		  parentcategory: 1,
		  discount: 1};
    	options = {sort:[["discount","desc"]],limit:limit};
        tools.getCollection(collectionTarget, function(collection) {
        	query.parentcategory = {"$in":"VODKA".split(",")};
			collection.find(query,fields,options).toArray(function(err, vodkaResults){
				returnResults = returnResults.concat(vodkaResults);
				query.parentcategory = {"$in":"SCOTCH".split(",")};
				collection.find(query,fields,options).toArray(function(err, scotchResults){
					returnResults = returnResults.concat(scotchResults);
					query.parentcategory = {"$in":"RUM".split(",")};
					collection.find(query,fields,options).toArray(function(err, rumResults){
						returnResults = returnResults.concat(rumResults);
						query.parentcategory = {"$in":"TEQUILA".split(",")};
						collection.find(query,fields,options).toArray(function(err, tequilaResults){
							returnResults = returnResults.concat(tequilaResults);
							query.parentcategory = {"$in":"WHISKEY".split(",")};
							collection.find(query,fields,options).toArray(function(err, whiskeyResults){
								returnResults = returnResults.concat(whiskeyResults);
								callback({"liquors":returnResults});
							});
						});
					});
				});
			});
        });
    },

    addEmailAlert: function(collectionTarget, itemId, email, isPrice, isStock){
		tools.getCollection(collectionTarget, function(collection) {
			if (isPrice==='true'){
				collection.update({_id:itemId}, {'$addToSet': {priceEmails:email}}, {w: 1}, function(err, result) {
					if (err){
						console.log("error adding email to item: "+itemId);
						console.log(err);
					}
				});
			}
			if (isStock==='true'){
				collection.update({_id:itemId}, {'$addToSet': {stockEmails:email}}, {w: 1}, function(err, result) {
					if (err){
						console.log("error adding email to item: "+itemId);
						console.log(err);
					}
				});
			}
		});
	},

	ensureIndexes: function(collectionTarget, callback){
		tools.getCollection(collectionTarget, function(collection) {
			collection.ensureIndex("parentcategory",function(err,parentcategoryresult){
				if (err){console.log("error checking parentcategory index")}
				else{
					collection.ensureIndex("category",function(err,categoryresult){
						if (err){console.log("error checking category index")}
						else{
							collection.ensureIndex({'discount':-1},function(err,discountresult){
								if (err){console.log("error checking discount index")}
								else{
									collection.ensureIndex("longdescription",function(err,longdescriptionresult){
										if (err){console.log("error checking longdescription index")}
										else{
											callback("done!");
										}
									});
								}
							});
						}
					});
				}
			});
		});
	},

	copyCollection: function(fromCollection, toCollection){
		tools.getCollection(fromCollection, function(origcollection) {
			origcollection.find().toArray(function(err, results){
				tools.getCollection(toCollection, function(newcollection) {
					for (var key in results){
						newcollection.insert(results[key], {w:1}, function(err,rs) {
							if (err){
								console.log("error importing item");
								console.log(err);
							}
						});
					}
				});
			});
		});
	},

	updateSaleFields: function(collectionTarget){
		tools.getCollection(collectionTarget, function(collection) {
			updateSaleField(collection.find(), collection, 1);
		});
	},

	updateDiscountFields: function(collectionTarget){
		tools.getCollection(collectionTarget, function(collection) {
			updateDiscountField(collection.find(), collection, 1);
		});
	}
};

var updateSaleField = function (itemCursor, collection, count){
	itemCursor.nextObject(function(err, result){
		if (err){
				console.log("error updating item");
				console.log(err);
		}
		if (result){
			var salePrice;
			var saleEnd;
			if (result.sale.length > 0){
				for (saleKey in result.sale){
					if (!saleEnd || result.sale[saleKey].saleenddate > saleEnd){
						salePrice = result.sale[saleKey].saleprice;
						saleEnd = result.sale[saleKey].saleenddate;
					}
				}
			}

			console.log(count++);
			
			var dbUpdates = {
				$set: {cursaleprice: salePrice,
					cursaleenddate: saleEnd}};
			collection.update({_id:result._id}, dbUpdates,function(err,rs) {
				if (err){
					console.log("error updating item");
					console.log(err);
				}else{
					updateSaleField(itemCursor, collection, count);
				}
			});
		}
	});
};

var updateDiscountField = function (itemCursor, collection, count){
	itemCursor.nextObject(function(err, result){
		if (err){
				console.log("error updating item");
				console.log(err);
		}
		if (result){
			var discount = null;
			
			if (result.cursaleprice){
				discount = 100 - ((result.cursaleprice/result.price) * 100);
			}

			console.log(count++);
			
			var dbUpdates = {
				$set: {discount: discount}};
			collection.update({_id:result._id}, dbUpdates,function(err,rs) {
				if (err){
					console.log("error updating item");
					console.log(err);
				}else{
					updateDiscountField(itemCursor, collection, count);
				}
			});
		}
	});
};