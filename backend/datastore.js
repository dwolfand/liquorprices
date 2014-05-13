var mongo = require('mongodb');
var tools = require('./tools');

var mongoUri = process.env.MONGOHQ_URL;

var dbConnection;
var collections = {};

module.exports = {
    getAllLiquors: function(collectionTarget, limit, category, parentcategory, searchString, mindiscount, callback){
        this.getCollection(collectionTarget, function(collection) {
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
        this.getCollection(collectionTarget, function(collection) {
			collection.find({"_id":_id},{},{}).toArray(function(err, results){
				inventoryFunction(_id, function(inventoryResult){
					var result = results[0];
					result.inventory = inventoryResult;
					callback({"liquorDetail":result});
				});
			});
        });
    },

    getSubscriptions: function(collectionTarget, email, callback){
    	emailSubscription = {};
    	fields = {size: 1, imgsrc: 1, longdescription: 1, parentcategory: 1};
        this.getCollection(collectionTarget, function(collection) {
			collection.find({"priceEmails":email},fields,{}).toArray(function(err, priceResults){
				emailSubscription.priceSubscriptions = priceResults;
				collection.find({"stockEmails":email},fields,{}).toArray(function(err, stockResults){
					emailSubscription.stockSubscriptions = stockResults;
					callback({"emailSubscription":emailSubscription});
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
        this.getCollection(collectionTarget, function(collection) {
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
		this.getCollection(collectionTarget, function(collection) {
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
		this.getCollection(fromCollection, function(origcollection) {
			origcollection.find().toArray(function(err, results){
				this.getCollection(toCollection, function(newcollection) {
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
		this.getCollection(collectionTarget, function(collection) {
			updateSaleField(collection.find(), collection, 1);
		});
	},

	updateDiscountFields: function(collectionTarget){
		this.getCollection(collectionTarget, function(collection) {
			updateDiscountField(collection.find(), collection, 1);
		});
	},

	getCollection: function(name, callback){
		if (!dbConnection){
			openConnection(function(db){
				openCollection(db, name, callback);
			});
		} else if (collections[name]){
			callback(collections[name]);
		} else {
			openCollection(dbConnection, name, callback);
		}
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