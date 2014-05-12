var mongo = require('mongodb');
var handlebars = require('handlebars');
var fs = require('fs');
var tools = require('./tools');
var datastore = require('./datastore');

var emailTemplate = '';

module.exports = {

	logRunEvent: function(targetCollection, curDate){
		datastore.getCollection(targetCollection+"-log", function(collection) {
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
		datastore.getCollection(targetCollection+"-email_log", function(collection) {
			collection.find({"queue":{"$exists": true}},{},{}).toArray(function(err, results){
				if (err){
					console.log("error getting emails from queue");
					console.log(err);
				}else{
					var emails = [];
					//need to load the results in memory before processing
					for (key in results){
						emails[results[key]._id] = results[key];
					}
					for (item in emails){
						getEmailMessage(emails[item].queue, emails[item]._id, function(emailBody){
							tools.sendEmail(emails[item]._id,"Liquor Updates", emailBody);
							collection.update({_id:emails[item]._id}, {'$unset':{queue:""},'$push': {'sent':{dateSent:curDate,message:emails[item].queue}}}, {w: 1}, function(err, result) {
								if (err){
									console.log("error processing email queue");
									console.log(err);
								}
							});
						});
					}
				}
			});
		});
	},

	loadLiquorsIntoDB: function(sourceLiquors, curDate, collectionTarget){
		datastore.getCollection(collectionTarget, function(collection) {
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
							var updates = getUpdatesOnLiquorObjects(existingLiquors[sourceLiquor._id], sourceLiquor, curDate, collectionTarget);
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

//Compares two liquor objects for updates - returns object with errors and sales ready for mongo update
var getUpdatesOnLiquorObjects = function(oldObj, newObj, curDate, collectionTarget){
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
		scheduleEmails('stockChange', oldObj.stockEmails, oldObj, null, curDate, collectionTarget);
	}
	if (oldObj.priceEmails && oldObj.priceEmails.length>0){
		var oldPrice = oldObj.cursaleenddate ? oldObj.cursaleprice : oldObj.price;
		var newPrice = newObj.cursaleenddate ? newObj.cursaleprice : newObj.price;
		if(newPrice < oldPrice){
			scheduleEmails('priceDrop', oldObj.priceEmails, oldObj, newPrice, curDate, collectionTarget);
		}
	}
	
	return updates;
};

var scheduleEmails = function(emailType, emails, oldItem, newValue, curDate, collectionTarget){
	datastore.getCollection(collectionTarget+'-email_log', function(collection) {
		var message = '';
		if (emailType === 'priceDrop'){
			message = "This item's price has dropped to $"+parseFloat(newValue).toFixed(2);
		}else if (emailType === 'stockChange'){
			message = 'This item is back in stock!';
		}
		for (key in emails){
			collection.update({_id:emails[key]}, {'$push': {'queue':{'dateQueued':curDate,
				message:message,
				itemId:oldItem._id,
				name:(oldItem.longdescription+' - '+oldItem.size)}}}, 
			{upsert:true, w: 1}, function(err, result) {
			//collection.insert({'email':emails[key],'dateSent':null,'dateQueued':curDate,'message':message}, {w:1}, function(err,rs) {
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

var getEmailTemplate = function(callback){
	if (emailTemplate === ''){
		fs.readFile('./backend/emailTemplate.html', 'utf8', function (err,source) {
		  if (err) {
		    console.log(err);
		  }else {
		  	emailTemplate = source;
			callback(emailTemplate);
		  }
		});
	}else {
		callback(emailTemplate);
	}
}

var getEmailMessage = function(queue, email, callback){
	getEmailTemplate(function(source){
		var template = handlebars.compile(source);
		var data = { "messages": queue, "email": email};
		var result = template(data);
		callback(result);
	});
	
};