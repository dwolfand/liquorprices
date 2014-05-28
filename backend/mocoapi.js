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
	LOCATIONS['wheaton'] = {displayName: 'Wheaton', lat:'39.0418833', lon:'-77.0513425', addr1:'11407 Georgia Avenue', addr2:'Silver Spring, MD 20902'};
	LOCATIONS['montrose'] = {displayName: 'Montrose', lat:'39.0543159', lon:'-77.1149852', addr1:'12015-B Rockville Pike', addr2:'Rockville, MD 20852'};
	LOCATIONS['rockville_pike'] = {displayName: 'Rockville Pike', lat:'39.076244', lon:'-77.137468', addr1:'832-836 Rockville Pike', addr2:'Rockville, MD 20852'};
	LOCATIONS['leisure_world'] = {displayName: 'Leisure World', lat:'39.1036888', lon:'-77.0756899', addr1:'3824-26 International Drive', addr2:'Silver Spring, MD 20906'};
	LOCATIONS['cloverly'] = {displayName: 'Cloverly', lat:'39.109519', lon:'-76.996401', addr1:'723 Cloverly St', addr2:'Silver Spring, MD 20905'};
	LOCATIONS['cabin_john'] = {displayName: 'Cabin John', lat:'39.0407502', lon:'-77.1590372', addr1:'11301 Seven Locks Road', addr2:'Potomac, MD 20854'};
	LOCATIONS['fallsgrove'] = {displayName: 'Fallsgrove', lat:'39.0980007', lon:'-77.1934896', addr1:'14937E Shady Grove Road', addr2:'Rockville, MD 20850'};
	LOCATIONS['muddy_branch'] = {displayName: 'Muddy Branch', lat:'39.1145466', lon:'-77.2159264', addr1:'866 Muddy Branch Road', addr2:'Gaithersburg, MD 20878'};
	LOCATIONS['darnestown'] = {displayName: 'Darnestown', lat:'39.1175073', lon:'-77.2512663', addr1:'12155 Darnestown Road', addr2:'Gaithersburg, MD 20878'};
	LOCATIONS['kingsview'] = {displayName: 'Kingsview', lat:'39.1585545', lon:'-77.2792207', addr1:'18323 Leaman Farm Road F-1', addr2:'Germantown, MD 20874'};
	LOCATIONS['walnut_hill'] = {displayName: 'Walnut Hill', lat:'39.126327', lon:'-77.183149', addr1:'16535 S. Frederick Road', addr2:'Gaithersburg, MD 20855'};
	LOCATIONS['goshen_crossing'] = {displayName: 'Goshen Crossing', lat:'39.1853596', lon:'-77.1874469', addr1:'20004-20008 Goshen Road', addr2:'Gaithersburg, MD 20879'};
	LOCATIONS['milestone'] = {displayName: 'Milestone', lat:'39.202887', lon:'-77.246714', addr1:'20946 Frederick Road Unit D1', addr2:'Germantown, MD 20876'};
	LOCATIONS['seneca_meadows'] = {displayName: 'Seneca Meadows', lat:'39.200322', lon:'-77.255175', addr1:'20680 Seneca Meadows Parkway, Suite A-2', addr2:'Germantown, MD 20876'};
	LOCATIONS['olney'] = {displayName: 'Olney', lat:'39.149837', lon:'-77.06628', addr1:'17825 Georgia Avenue', addr2:'Olney, MD 20832'};

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
			//console.log(results);
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
	destination.cursalestartdate=null;
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
	destination.age = null;
	destination.proof = null;
	destination.lastUpdated = curDate;
	destination.createddate = curDate; //adding this field only for initial insert
	destination.parentcategory = null;
	if (source.categoryname.indexOf("VODKA") > -1){
		destination.parentcategory = "VODKA";
	}else if (source.categoryname.indexOf("SCOTCH") > -1){
		destination.parentcategory = "SCOTCH";
	}else if (source.categoryname.indexOf("WHISKEY") > -1 || source.categoryname.indexOf("BOURBON") > -1 || source.categoryname.indexOf("BOTTLED IN BOND") > -1){
		destination.parentcategory = "WHISKEY";
	}else if (source.categoryname.indexOf("RUM") > -1){
		destination.parentcategory = "RUM";
	}else if (source.categoryname.indexOf("TEQUILA") > -1){
		destination.parentcategory = "TEQUILA";
	}else if (source.categoryname.indexOf("GIN") > -1){
		destination.parentcategory = "GIN";
	}else if (source.categoryname.indexOf("COGNAC") > -1 || source.categoryname.indexOf("BRANDY") > -1 
			  || source.categoryname.indexOf("GRAPPA") > -1 || source.categoryname.indexOf("DOMESTIC CORDIALS") > -1
			  || source.categoryname.indexOf("IMPORTED CORDIALS") > -1 || source.categoryname.indexOf("ARMAGNAC")  > -1){
		destination.parentcategory = "OTHER_LIQUORS";
	}else if (source.categoryname.indexOf("SPARKLING") > -1 || source.categoryname.indexOf("CHAMPAGNE") > -1){
		destination.parentcategory = "SPARKLING_WINE";
	}else if (source.categoryname.indexOf("AMERICAN BLUSH") > -1 || source.categoryname.indexOf("AMERICAN RED") > -1 
			  || source.categoryname.indexOf("AMERICAN WHITE") > -1 || source.categoryname.indexOf("AMERICAN TABLE WINE") > -1){
		destination.parentcategory = "AMERICAN_WINE";
	}else if (source.categoryname.indexOf("ARGENTINA") > -1 || source.categoryname.indexOf("ASIAN") > -1 
			  || source.categoryname.indexOf("AUSTRALIAN") > -1 || source.categoryname.indexOf("CHILE") > -1
			  || source.categoryname.indexOf("GERMAN WINE") > -1 || source.categoryname.indexOf("GREEK") > -1 
			  || source.categoryname.indexOf("ITALIAN RED WINE") > -1 || source.categoryname.indexOf("ITALIAN ROSE WINE") > -1
			  || source.categoryname.indexOf("ITALIAN WHITE WINE") > -1 || source.categoryname.indexOf("KOSHER") > -1 
			  || source.categoryname.indexOf("NEW ZEALAND") > -1 || source.categoryname.indexOf("SOUTH AFRICAN") > -1
			  || source.categoryname.indexOf("SPANISH/PORTUGUESE") > -1){
		destination.parentcategory = "IMPORTED_WINE";
	}else if (source.categoryname.indexOf("FRANCE-OTHER") > -1 || source.categoryname.indexOf("FRENCH BLUSH") > -1 
			  || source.categoryname.indexOf("LOIRE VALLEY WINE") > -1 || source.categoryname.indexOf("RED BORDEAUX WINE") > -1
			  || source.categoryname.indexOf("RED BURGUNDY WINE") > -1 || source.categoryname.indexOf("RHONE RED WINE") > -1 
			  || source.categoryname.indexOf("RHONE WHITE WINE") > -1 || source.categoryname.indexOf("WHITE BORDEAUX WINE") > -1
			  || source.categoryname.indexOf("WHITE BURGUNDY WINE") > -1 || source.categoryname.indexOf("ALSATIAN WINE") > -1){
		destination.parentcategory = "FRENCH_WINE";
	}else if (source.categoryname.indexOf("PORT") > -1 || source.categoryname.indexOf("SHERRY") > -1 
			  || source.categoryname.indexOf("DESSERT") > -1 || source.categoryname.indexOf("VERMOUTH") > -1
			  || source.categoryname.indexOf("APERITIF") > -1){
		destination.parentcategory = "OTHER_WINE";
	}else if (source.categoryname.indexOf("NON-ALCOHOLIC MIXERS") > -1 || source.categoryname.indexOf("PRE-MIX COCKTAILS") > -1){
		destination.parentcategory = "MIXERS";
	}else {
		destination.parentcategory = "OTHER";
	}
	
	return destination;
};
