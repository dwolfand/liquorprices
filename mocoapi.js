var request = require('request');

module.exports = {
  getAllLiquors: function (curDate, callback) {
    	var payload = {
		'displaycnt':10,
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
		//proxy : 'http://127.0.0.1:8888',
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
			callback(sourceLiquors, curDate);			
		}
		else{
			console.log('ERROR!');
			console.log(error);
		}
	};

	request(options, requestCallback);
  }
};

var transformMocoObjToLPObj = function (source, curDate){
	var destination = {};
	
	destination._id = source.itemcode;
	destination.description = source.description;
	destination.size = source.size;
	destination.price = parseFloat(source.price);
	destination.sale = [];
	if (source.saleprice !== 'N/A'){
		destination.sale = [{'saleprice':parseFloat(source.saleprice),'saleenddate':new Date(source.saleenddate)}];
	}
	if (source.itemcode === "42165"){
		destination.sale = [{'saleprice':parseFloat("1.420"),'saleenddate':new Date('01/01/2015')}];
	}
	destination.category = source.categoryname;
	destination.imgsrc = source.imgsrc;
	destination.longdescription = source.longdescription;
	destination.status = source.qtyStatus;	
	destination.lastUpdated = curDate;
	destination.createddate = curDate; //adding this field only for initial insert
	
	return destination;
};
