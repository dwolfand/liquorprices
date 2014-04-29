var mongo = require('mongodb');
var tools = require('./tools');

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://david:liquorpricespass@localhost:10062/liquorprices';
var liquorPricesCollection = process.env.LIQUOR_PRICES_COLLECTION_NAME || 'liquorpricesdev';

var 

module.exports = {
	loadLiquorsIntoDB: function(sourceLiquors, curDate){
		console.log("connecting to mongo db to insert records");
		mongo.Db.connect(mongoUri, function (err, db) {
			console.log("connected to mongo db: "+db);
			db.collection(liquorPricesCollection, function(er, collection) {
				console.log("accessing collection: "+collection);
				//collection.remove({},function(err, removed){
					//console.log("removed collection documents: "+removed);
					collection.find().toArray(function(err, results){
						if (er){
							console.log("error fetching all items");
							console.log(er);
						}
						var existingLiquors = mapDBResults(results);
						
						for (key in sourceLiquors) {
							var sourceLiquor = sourceLiquors[key];
							if (!existingLiquors[sourceLiquor._id]){ //means we need to add the new item
								console.log("item not found, inserting new record: "+sourceLiquor._id);
								collection.insert(sourceLiquor, {w:1}, function(er,rs) {
									if (er){
										console.log("error importing item");
										console.log(er);
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
											category: sourceLiquor.category,
											imgsrc: sourceLiquor.imgsrc,
											longdescription: sourceLiquor.longdescription,
											status: sourceLiquor.status,
											lastUpdated: curDate},		
										$addToSet: updates};
										
									collection.update({_id:sourceLiquor._id}, dbUpdates,function(er,rs) {
											if (er){
												console.log("error updating item");
												console.log(er);
											}
									});
								}
							}
						}

						console.log("finished sending commands");
					});
				//});
			});
		});
	}
};

//Compares two liquor objects for updates - returns object with errors and sales ready for mongo update
var getUpdatesOnLiquorObjects = function(oldObj, newObj, curDate){
	var updates = {};
	var errors = [];
	
	if (newObj.sale[0]){
		var found = false;
		for (key in oldObj.sale) {
			if (oldObj.sale[key].saleprice === newObj.sale[0].saleprice && oldObj.sale[key].saleenddate.getTime() === newObj.sale[0].saleenddate.getTime()){
				found = true;
				break;
			}
		}
		if (!found){
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