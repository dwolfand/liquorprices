var request = require('request');
var tools = require('./tools');
var moment = require('moment');
var fs = require('fs');
var $ = jQuery = require('jquery');
require('./jquery.csv.js');

module.exports = {
  getAllLiquors: function (curDate, collectionTarget, callback) {
  	var curMoment = moment(curDate), 
  		priceListFileName = getPriceListFileName(curMoment), 
  		saleListFileName = getSaleListFileName(curMoment);
	fetchCSV('http://www.abc.virginia.gov/Pricelist/text/'+priceListFileName+'.csv', function(normalData){
		var sourceLiquors = {};
	    for(var i=0, len=normalData.length; i<len; i++) {
	      //console.log(normalData[i]);
	      sourceLiquors[normalData[i].Code] = normalData[i];
	    }
	    fetchCSV('http://www.abc.virginia.gov/Pricelist/text/'+saleListFileName+'.csv', function(saleData){
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
		if (!error && response.statusCode === 200){
			var csv = body.replace('""',"'\"").replace("'V\" ","'V\",\"");
			try {
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
			catch(err) {
				console.log("Error processing CSV from VA ABC");
				console.log(err);
			}
			
		}
		else {
			console.log("Error fetching CSV from VA ABC");
			console.log(error);
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

var getPriceListFileName = function (curMoment){
	var priceListFileName;
	switch(curMoment.month()) {
	case 0:
	case 1:
	case 2:
	    priceListFileName = 'jan';
	    break;
	case 3:
	case 4:
	case 5:
	    priceListFileName = 'apr';
	    break;
	case 6:
	case 7:
	case 8:
	    priceListFileName = 'jul';
	    break;
	case 9:
	case 10:
	case 11:
	    priceListFileName = 'oct';
	    break;
	}
	return priceListFileName+(curMoment.year()-2000);
};

var getSaleListFileName = function (curMoment){
	var monthNames = [ "disjan", "disfeb", "dismar", "disapr", "dismay", "disjun",
    "disjul", "disaug", "dissep", "disoct", "disnov", "disdec" ];
	var saleListFileName = monthNames[curMoment.month()]+(curMoment.year()-2000);
	return saleListFileName;
};
