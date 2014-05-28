var request = require('request');
var tools = require('./tools');
var moment = require('moment');
var fs = require('fs');
var $ = jQuery = require('jQuery');
require('./jquery.csv.js');

module.exports = {
  getAllLiquors: function (curDate, collectionTarget, callback) {
  	curDate = tools.parseDate('4/1/2014');
	fetchCSV('http://www.abc.virginia.gov/Pricelist/text/apr14.csv', function(normalData){
		var sourceLiquors = {};
	    for(var i=0, len=normalData.length; i<len; i++) {
	      //console.log(normalData[i]);
	      sourceLiquors[normalData[i].Code] = normalData[i];
	    }
	    fetchCSV('http://www.abc.virginia.gov/Pricelist/text/dismay14.csv', function(saleData){
	    	for(var i=0, len=saleData.length; i<len; i++) {
	          var source = sourceLiquors[saleData[i].Code];
	          if (source){
	          	source.salePrice = saleData[i]["Sale Bottle Price"];
	          	source.saleStartDate = tools.parseDate('5/1/2014');
	          	source.saleEndDate = tools.parseDate('5/31/2014');
	          }
		    }
		    for (key in sourceLiquors){
		    	sourceLiquors[key] = transformVAObjToLPObj(sourceLiquors[key], curDate);
		    }
		    callback(sourceLiquors, curDate, collectionTarget);
		});
	});
  }
};

var fetchCSV = function(sourceUrl, callback){
	request({url:sourceUrl,method:"GET"}, function(error, response, body){
		if (!error){
			var csv = body.replace('""',"'\"").replace("'V\" ","'V\",\"");
			$.csv.toObjects(csv, {}, function(errparsing, data) {
				if (!errparsing){
					callback(data);
				}
				else {
					console.log("Error parsing CSV from VA ABC");
					console.log(errparsing);
				}
			});
		}
		else {
			console.log("Error fetching CSV from VA ABC");
			console.log(err);
		}
	});
	// fs.readFile(url, 'UTF-8', function(err, csv) {
		
	// });
};

var transformVAObjToLPObj = function (source, curDate){
	var destination = {};
	
	destination._id = source.Code;
	destination.description = source.Brand + " " + source.Size;
	destination.size = source.Size;
	destination.price = parseFloat(source.Price.replace("$",""));
	destination.sale = [];
	destination.cursaleprice=null;
	destination.cursalestartdate=null;
	destination.cursaleenddate=null;
	if (source.salePrice && source.salePrice !== 'N/A'){
		destination.sale = [{'saleprice':parseFloat(source.salePrice),'saleenddate':source.saleEndDate,'salestartdate':source.saleStartDate}];
		//console.log("display:"+new moment.utc(tools.parseDate(source.saleenddate)).format());
		destination.cursaleprice = parseFloat(source.salePrice);
		destination.cursalestartdate = source.saleStartDate;
		destination.cursaleenddate = source.saleEndDate;
	}
	destination.discount = null;
	if (destination.cursaleprice){
		destination.discount = 100 - ((destination.cursaleprice/destination.price) * 100);
	}
	destination.category = source.Description;
	destination.longdescription = source.Brand;
	destination.imgsrc = null;
	destination.status = null;
	destination.age = source.Age;
	destination.proof = source.Proof;
	destination.lastUpdated = curDate;
	destination.createddate = curDate; //adding this field only for initial insert
	destination.parentcategory = null;
	if (destination.category.indexOf("VODKA") > -1){
		destination.parentcategory = "VODKA";
	}else if (destination.category.indexOf("SCOTCH") > -1){
		destination.parentcategory = "SCOTCH";
	}else if (destination.category.indexOf("WHISKEY") > -1 || destination.category.indexOf("BOURBON") > -1 || destination.category.indexOf("BOTTLED IN BOND") > -1){
		destination.parentcategory = "WHISKEY";
	}else if (destination.category.indexOf("RUM") > -1){
		destination.parentcategory = "RUM";
	}else if (destination.category.indexOf("TEQUILA") > -1){
		destination.parentcategory = "TEQUILA";
	}else if (destination.category.indexOf("GIN") > -1){
		destination.parentcategory = "GIN";
	}else if (destination.category.indexOf("COGNAC") > -1 || destination.category.indexOf("BRANDY") > -1 
			  || destination.category.indexOf("GRAPPA") > -1 || destination.category.indexOf("DOMESTIC CORDIALS") > -1
			  || destination.category.indexOf("CORDIALS") > -1 || destination.category.indexOf("ARMAGNAC")  > -1 
			  || destination.category.indexOf("MOONSHINE")  > -1 || destination.category.indexOf("VERMOUTH")  > -1){
		destination.parentcategory = "OTHER_LIQUORS";
	}else if (destination.category.indexOf("VIRGINIA") > -1){
		destination.parentcategory = "AMERICAN_WINE";
	}else if (destination.category.indexOf("MIXERS") > -1 || destination.category.indexOf("Rimmers") > -1){
		destination.parentcategory = "MIXERS";
	}else {
		destination.parentcategory = "OTHER";
	}
	
	return destination;
};
