var mongo = require('mongodb');
var tools = require('./tools');

var mongoUri = process.env.MONGOHQ_URL;

var dbConnection;
var collections = {};

module.exports = {
    getAllLiquors: function(collectionTarget, limit, category, parentcategory, searchString, mindiscount, callback){
        getCollection(collectionTarget, function(collection) {
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
        getCollection(collectionTarget, function(collection) {
			collection.find({"_id":_id},{},{}).toArray(function(err, results){
				inventoryFunction(_id, function(inventoryResult){
					var result = results[0];
					result.inventory = inventoryResult;
					callback({"liquorDetail":result});
				});
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
    	options = {sort:[["discount","desc"]],limit:limit};
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
								callback({"liquors":returnResults});
							});
						});
					});
				});
			});
        });
    },

    addEmailAlert: function(collectionTarget, itemId, email, isPrice, isStock){
		getCollection(collectionTarget, function(collection) {
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

	logRunEvent: function(targetCollection, curDate){
		getCollection(targetCollection+"-log", function(collection) {
			collection.update({type:"DBLoadEvent"}, {'$set':{type:"DBLoadEvent"}, '$push': {'runs':curDate}}, {upsert:true, w: 1}, function(err, result) {
				if (err){
					console.log("error adding the DBLoadEvent");
					console.log(err);
				}
			});
		});
	},

	sendEmailsFromQueue: function(targetCollection){
		var curDate = new Date();
		getCollection(targetCollection+"-email", function(collection) {
			collection.find({dateSent:null},{},{}).toArray(function(err, results){
				if (err){
					console.log("error getting emails from queue");
					console.log(err);
				}else{
					for (key in results){
						//console.log(results[key]);
						tools.sendEmail(results[key].email,"Liquor Updates",results[key].message);
						collection.update({_id:results[key]._id}, {$set:{dateSent:curDate}}, {w: 1}, function(err, result) {
							if (err){
								console.log("error adding email queue");
								console.log(err);
							}
						});
					}
				}
			});
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
								//console.log(sourceLiquor._id);
								var dbUpdates = {
									$set: {cursaleprice: sourceLiquor.cursaleprice,
										cursaleenddate: sourceLiquor.cursaleenddate,
										discount: sourceLiquor.discount,
										imgsrc: sourceLiquor.imgsrc,
										status: sourceLiquor.status,
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
	// if (newObj.imgsrc !== oldObj.imgsrc){
	// 	errors.push({itemChanged:"imgsrc", oldValue:oldObj.imgsrc, newValue:newObj.imgsrc, changedDate:curDate});
	// }
	if (newObj.longdescription !== oldObj.longdescription){
		errors.push({itemChanged:"longdescription", oldValue:oldObj.longdescription, newValue:newObj.longdescription, changedDate:curDate});
	}
	// if (newObj.status !== oldObj.status){
	// 	errors.push({itemChanged:"status", oldValue:oldObj.status, newValue:newObj.status, changedDate:curDate});
	// }
	// Leaving this out for now until categories get ironed out
	// if (newObj.parentcategory !== oldObj.parentcategory){
	// 	errors.push({itemChanged:"parentcategory", oldValue:oldObj.parentcategory, newValue:newObj.parentcategory, changedDate:curDate});
	// }
	
	if (errors.length > 0){
		updates.errors = {$each: errors};
	}

	//check if emails should be sent
	if (oldObj.stockEmails && oldObj.stockEmails.length>0 && oldObj.status !== newObj.status && newObj.status === "IN STOCK"){
		scheduleEmails('stockChange', oldObj.stockEmails, oldObj, null, curDate);
	}
	if (oldObj.priceEmails && oldObj.priceEmails.length>0){
		var oldPrice = oldObj.cursaleenddate ? oldObj.cursaleprice : oldObj.price;
		var newPrice = newObj.cursaleenddate ? newObj.cursaleprice : newObj.price;
		if(newPrice < oldPrice){
			scheduleEmails('priceDrop', oldObj.priceEmails, oldObj, newPrice, curDate);
		}
	}
	
	return updates;
};

var scheduleEmails = function(emailType, emails, oldItem, newValue, curDate){
	getCollection('liquorpricesdev-email', function(collection) {
		var message = emailType+' - '+oldItem.description;
		for (key in emails){
			collection.insert({'email':emails[key],'dateSent':null,'dateQueued':curDate,'message':message}, {w:1}, function(err,rs) {
				if (err){
					console.log("error adding email queue");
					console.log(err);
				}
			});
		}
	});
};

var mapDBResults = function(results){
	console.log('parsing db items into list');
	var resultsList = [];
	for (key in results) {
		resultsList[results[key]._id] = results[key];
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