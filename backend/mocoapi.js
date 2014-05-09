var request = require('request');
var tools = require('./tools');
var moment = require('moment');

var LOCATIONS = [];
	LOCATIONS['burtonsville'] = {displayName: 'Burtonsville', lat:'39.111217', lon:'-76.932767', addr1:'15620 Old Columbia Pike', addr2:'Burtonsville, MD 20866'};
	LOCATIONS['westwood'] = {displayName: 'Westwood', lat:'38.9647183', lon:'-77.1070797', addr1:'5432 Westbard Avenue', addr2:'Bethesda, MD 20814'};
	LOCATIONS['chevy_chase'] = {displayName: 'Chevy Chase', lat:'38.9621691', lon:'-77.084996', addr1:'11 Wisconsin Circle', addr2:'Bethesda, MD 20815'};
	LOCATIONS['clarksburg_village'] = {displayName: 'Clarksburg Village', lat:'39.2306815', lon:'-77.2506364', addr1:'12051 Chestnut Branch Way, Suite C-1', addr2:'Clarksburg, MD 20871'};
	LOCATIONS['silver_spring'] = {displayName: 'Silver Spring', lat:'38.997945', lon:'-77.026425', addr1:'8715 Colesville Road', addr2:'Silver Spring, MD 20910'};
	LOCATIONS['flower_ave'] = {displayName: 'Flower Ave', lat:'38.998453', lon:'-77.0033725', addr1:'8701 Flower Avenue', addr2:'Silver Spring, MD 20901'};
	LOCATIONS['hampden_lane'] = {displayName: 'Hampden Lane', lat:'38.9826759', lon:'-77.0969244', addr1:'4920 Hampden Lane', addr2:'Bethesda, MD 20814'};
	LOCATIONS['potomac'] = {displayName: 'Potomac', lat:'39.0177848', lon:'-77.208583', addr1:'10132 River Road', addr2:'Potomac, MD 20854'};
	LOCATIONS['kensington'] = {displayName: 'Kensington', lat:'39.0336747', lon:'-77.0728248', addr1:'3733 University Boulevard', addr2:'Kensington, MD 20895'};
	LOCATIONS['white_oak'] = {displayName: 'White Oak', lat:'39.0419057', lon:'-76.9913832', addr1:'11239 New Hampshire Avenue', addr2:'Silver Spring, MD 20904'};
	LOCATIONS['wheaton'] = {displayName: 'Wheaton', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['montrose'] = {displayName: 'Montrose', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['rockville_pike'] = {displayName: 'Rockville Pike', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['leisure_world'] = {displayName: 'Leisure World', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['cloverly'] = {displayName: 'Cloverly', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['cabin_john'] = {displayName: 'Cabin_john', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['fallsgrove'] = {displayName: 'Fallsgrove', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['muddy_branch'] = {displayName: 'Muddy Branch', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['darnestown'] = {displayName: 'Darnestown', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['kingsview'] = {displayName: 'Kingsview', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['walnut_hill'] = {displayName: 'Walnut Hill', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['goshen_crossing'] = {displayName: 'Goshen Crossing', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['milestone'] = {displayName: 'Milestone', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['seneca_meadows'] = {displayName: 'Seneca Meadows', lat:'', lon:'', addr1:'', addr2:''};
	LOCATIONS['olney'] = {displayName: 'Olney', lat:'', lon:'', addr1:'', addr2:''};

module.exports = {
  getAllLiquors: function (curDate, recordsToImport, collectionTarget, callback) {
    	var payload = {
		'displaycnt':recordsToImport,
		'keyword':'',
		'pricemin':'0',
		'pricemax':'10000',
		'category':'null',
		'categorymain':'',
		'size':'null',
		'isSale':'0',
		'sortid':'longdescription'
		};
	var options = {
		url: 'http://www2.montgomerycountymd.gov/dlcsearch/SearchSupportService.asmx/GetSearchData',
		method: 'POST',
		body: payload,
		json: true
		};
	
	function requestCallback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("got response from moco, calling callback to process data");
			var sourceLiquors = [];
			for (key in body.d){
				sourceLiquors.push(transformMocoObjToLPObj(body.d[key], curDate));
			}
			callback(sourceLiquors, curDate, collectionTarget);			
		}
		else{
			console.log('ERROR GETTING LIQOURS!');
			console.log(error);
		}
	};

	request(options, requestCallback);
  },

  getInventoryForItem: function (itemId, callback) {
	var options = {
		url: 'http://www2.montgomerycountymd.gov/dlcsearch/SearchSupportService.asmx/GetAllStoreAvailability',
		method: 'POST',
		body: {'itemId':itemId},
		json: true
		};
	
	var requestCallback = function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var results = parseInventory(body.d);
			console.log(results);
			callback(results);
		}
		else{
			console.log('ERROR GETTING INVENTORY!');
			console.log(error);
		}
	};

	request(options, requestCallback);
  }
};

var parseInventory = function(response){
	var result = [];
	for (key in response){
		var item = {};
		item.name = locationName = (response[key].storeName).slice((response[key].storeName).indexOf('stores/')+7,(response[key].storeName).indexOf('.html'));
		item.count = response[key].Availability;
		var tempLocation = LOCATIONS[item.name];
		if (tempLocation){
			item.displayName = tempLocation.displayName;
			item.lat = tempLocation.lat;
			item.lon = tempLocation.lon;
			item.addr1 = tempLocation.addr1;
			item.addr2 = tempLocation.addr2;
		}
		result.push(item);
	}
	return result;
};

var transformMocoObjToLPObj = function (source, curDate){
	var destination = {};
	
	destination._id = source.itemcode;
	destination.description = source.description;
	destination.size = source.size;
	destination.price = parseFloat(source.price);
	destination.sale = [];
	destination.cursaleprice=null;
	destination.cursaleenddate=null;
	if (source.saleprice !== 'N/A'){
		destination.sale = [{'saleprice':parseFloat(source.saleprice),'saleenddate':tools.parseDate(source.saleenddate)}];
		//console.log("display:"+new moment.utc(tools.parseDate(source.saleenddate)).format());
		destination.cursaleprice = parseFloat(source.saleprice);
		destination.cursaleenddate = tools.parseDate(source.saleenddate);
	}
	destination.discount = null;
	if (destination.cursaleprice){
		destination.discount = 100 - ((destination.cursaleprice/destination.price) * 100);
	}
	destination.category = source.categoryname;
	destination.imgsrc = source.imgsrc;
	destination.longdescription = source.longdescription;
	destination.status = source.qtyStatus;	
	destination.lastUpdated = curDate;
	destination.createddate = curDate; //adding this field only for initial insert
	destination.parentcategory = null;
	if (source.categoryname.indexOf("VODKA") > -1){
		destination.parentcategory = "VODKA";
	}else if (source.categoryname.indexOf("SCOTCH") > -1){
		destination.parentcategory = "SCOTCH";
	}else if (source.categoryname.indexOf("WHISKEY") > -1 || source.categoryname.indexOf("BOURBON") > -1){
		destination.parentcategory = "WHISKEY";
	}else if (source.categoryname.indexOf("RUM") > -1){
		destination.parentcategory = "RUM";
	}else if (source.categoryname.indexOf("TEQUILA") > -1){
		destination.parentcategory = "TEQUILA";
	}else if (source.categoryname.indexOf("GIN") > -1){
		destination.parentcategory = "GIN";
	}else {
		destination.parentcategory = "OTHER";
	}
	
	return destination;
};
