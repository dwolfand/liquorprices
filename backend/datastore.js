var mongo = require('mongodb');
var tools = require('./tools');

var mongoUri = process.env.MONGOHQ_URL;

var dbConnection;
var collections = {};

module.exports = {
    getAllLiquors: function(collectionTarget, limit, category, parentcategory, mindiscount, callback){
        getCollection(collectionTarget, function(collection) {
        	query = {};
        	if (category){
        		query.category = {"$in":category.split(",")};
        	}
        	if (parentcategory){
        		query.parentcategory = {"$in":parentcategory.split(",")};
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

    getLiquorById: function(collectionTarget, _id, callback){
        getCollection(collectionTarget, function(collection) {
			collection.find({"_id":_id},{},{}).toArray(function(err, results){
				callback({"liquorDetail":results[0]});
			});
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
    	options = {sort:[["discount","desc"]],limit:3};
        getCollection(collectionTarget, function(collection) {
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
								query.parentcategory = {"$in":"OTHER".split(",")};
								collection.find(query,fields,options).toArray(function(err, otherResults){
									returnResults = returnResults.concat(otherResults);
									callback({"liquors":returnResults});
								});
							});
						});
					});
				});
			});
        });
    },

    maxPercent: function(percent, collectionTarget, callback){
        getCollection(collectionTarget, function(collection) {
			collection.find().toArray(function(err, results){
				var liquors = mapDBResults(results);
				var returnResult = [];
				var lowestSale;
				var liquor;
				for (var key in liquors){
                    liquor = liquors[key];
                    for (var saleKey in liquor.sale){
                        if (lowestSale && liquor.sale[saleKey].saleprice < lowestSale.saleprice){
                            lowestSale = liquor.sale[saleKey];
                        }else{
                            lowestSale = liquor.sale[saleKey];
                        }
                    }
                    if (lowestSale && (lowestSale.saleprice/liquor.price)*100 <= percent){
                        liquor.percent = (lowestSale.saleprice/liquor.price)*100;
                        returnResult.push(liquor);
                    }
                    lowestSale = undefined;
				}
				callback(returnResult);
			});
        });
    },
    
	findDiff: function(callback){
		var diffs = [];
		getCollection('originalliquorprices', function(origcollection) {
			origcollection.find().toArray(function(err, results){
				var orig = mapDBResults1(results);
				getCollection('liquorprices', function(newcollection) {
					newcollection.find().toArray(function(err, newresults){
						var newstuff = mapDBResults(newresults);
						var count = 0;
						for (var key in orig){
							count++;
							if (!newstuff[orig[key].itemcode]){
								console.log(orig[key]);
								diffs.push(orig[key].itemcode);
							}
							//if (count>10) break;
						}
						console.log(diffs);
						callback(diffs);
					});
				});
			});
		});
	},

	copyCollection: function(fromCollection, toCollection){
		getCollection(fromCollection, function(origcollection) {
			origcollection.find().toArray(function(err, results){
				getCollection(toCollection, function(newcollection) {
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
		getCollection(collectionTarget, function(collection) {
			updateSaleField(collection.find(), collection, 1);
		});
	},

	updateDiscountFields: function(collectionTarget){
		getCollection(collectionTarget, function(collection) {
			updateDiscountField(collection.find(), collection, 1);
		});
	},

	loadLiquorsIntoDB: function(sourceLiquors, curDate, collectionTarget){
		getCollection(collectionTarget, function(collection) {
			//collection.remove({},function(err, removed){
				//console.log("removed collection documents: "+removed);
				collection.find().toArray(function(err, results){
					if (err){
						console.log("error fetching all items");
						console.log(err);
					}
					var existingLiquors = mapDBResults(results);
					
					for (key in sourceLiquors) {
						var sourceLiquor = sourceLiquors[key];
						if (!existingLiquors[sourceLiquor._id]){ //means we need to add the new item
							console.log("item not found, inserting new record: "+sourceLiquor._id);
							collection.insert(sourceLiquor, {w:1}, function(err,rs) {
								if (err){
									console.log("error importing item");
									console.log(err);
								}
							});
						}
						else { //we found the existing item, so check for changes and sales
							var updates = getUpdatesOnLiquorObjects(existingLiquors[sourceLiquor._id], sourceLiquor, curDate);
							if (!tools.isEmptyObject(updates)){//check if there are any updates needed
								console.log('updating record: '+sourceLiquor._id);
								var dbUpdates = {
									$set: {description: sourceLiquor.description,
										size: sourceLiquor.size,
										price: sourceLiquor.price,
										cursaleprice: sourceLiquor.cursaleprice,
										cursaleenddate: sourceLiquor.cursaleenddate,
										discount: sourceLiquor.discount,
										category: sourceLiquor.category,
										imgsrc: sourceLiquor.imgsrc,
										longdescription: sourceLiquor.longdescription,
										status: sourceLiquor.status,
										parentcategory: sourceLiquor.parentcategory,
										lastUpdated: curDate},		
									$addToSet: updates};
									
								collection.update({_id:sourceLiquor._id}, dbUpdates,function(err,rs) {
										if (err){
											console.log("error updating item");
											console.log(err);
										}
								});
							} else {
								var dbUpdates = {
									$set: {cursaleprice: sourceLiquor.cursaleprice,
										cursaleenddate: sourceLiquor.cursaleenddate,
										discount: sourceLiquor.discount,
										parentcategory: sourceLiquor.parentcategory,
										lastUpdated: curDate}};
								collection.update({_id:sourceLiquor._id}, dbUpdates,function(err,rs) {
										if (err){
											console.log("error updating last mod date");
											console.log(err);
										}
								});
							}
						}
					}

					console.log("finished sending commands");
				});
			//});
		});
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

var getCollection = function(name, callback){
	if (!dbConnection){
		openConnection(function(db){
			openCollection(db, name, callback);
		});
	} else if (collections[name]){
		callback(collections[name]);
	} else {
		openCollection(dbConnection, name, callback);
	}
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
}

//Compares two liquor objects for updates - returns object with errors and sales ready for mongo update
var getUpdatesOnLiquorObjects = function(oldObj, newObj, curDate){
	var updates = {};
	var errors = [];
	
	if (newObj.cursaleenddate){
		if (!oldObj.cursaleenddate || oldObj.cursaleenddate.getTime() !== newObj.cursaleenddate.getTime()){
			updates.sale = {$each: newObj.sale, $position: '0'};//newobj.sale will always be an array of 1 item - the new value
				//the position parameter does not seem to be working, but leaving it in for now
		}
	}
	
	if (newObj.price !== oldObj.price){
		errors.push({itemChanged:"price", oldValue:oldObj.price, newValue:newObj.price, changedDate:curDate});
	}
	if (newObj.description !== oldObj.description){
		errors.push({itemChanged:"description", oldValue:oldObj.description, newValue:newObj.description, changedDate:curDate});
	}
	if (newObj.size !== oldObj.size){
		errors.push({itemChanged:"size", oldValue:oldObj.size, newValue:newObj.size, changedDate:curDate});
	}
	if (newObj.category !== oldObj.category){
		errors.push({itemChanged:"category", oldValue:oldObj.category, newValue:newObj.category, changedDate:curDate});
	}
	if (newObj.imgsrc !== oldObj.imgsrc){
		errors.push({itemChanged:"imgsrc", oldValue:oldObj.imgsrc, newValue:newObj.imgsrc, changedDate:curDate});
	}
	if (newObj.longdescription !== oldObj.longdescription){
		errors.push({itemChanged:"longdescription", oldValue:oldObj.longdescription, newValue:newObj.longdescription, changedDate:curDate});
	}
	if (newObj.status !== oldObj.status){
		errors.push({itemChanged:"status", oldValue:oldObj.status, newValue:newObj.status, changedDate:curDate});
	}
	// Leaving this out for now until categories get ironed out
	// if (newObj.parentcategory !== oldObj.parentcategory){
	// 	errors.push({itemChanged:"parentcategory", oldValue:oldObj.parentcategory, newValue:newObj.parentcategory, changedDate:curDate});
	// }
	
	if (errors.length > 0){
		updates.errors = {$each: errors};
	}
	
	return updates;
};

var mapDBResults = function(results){
	console.log('parsing db items into list');
	var resultsList = [];
	for (key in results) {
		resultsList[results[key]._id] = results[key];
	}
	return resultsList;
};

var mapDBResults1 = function(results){
	console.log('parsing db items into list');
	var resultsList = [];
	for (key in results) {
		resultsList[results[key].itemcode] = results[key];
	}
	return resultsList;
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