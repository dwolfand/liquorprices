'use strict';

module.exports = App.ApplicationController = Ember.Controller.extend({
  searchstring:'',
  actions: {
    search: function() {
      $('#liquorprices-menu').removeClass('in'); //close menu if its collapsed and open
      if (this.searchstring.length < 3){
      	$('.searchStringLengthError').modal('toggle');
      }else{
      	this.transitionToRoute("/search/"+this.searchstring);
      }
    },
    navigate: function(pageId){
    	var url='';
    	$('#scotch').removeClass('active');
    	$('#scotch-all').removeClass('active');
    	$('#scotch-blended').removeClass('active');
    	$('#scotch-single').removeClass('active');
    	$('#vodka').removeClass('active');
    	$('#vodka-all').removeClass('active');
    	$('#vodka-domestic').removeClass('active');
    	$('#vodka-imported').removeClass('active');
    	$('#rum').removeClass('active');
    	$('#whiskey').removeClass('active');
    	$('#tequila').removeClass('active');
    	$('#gin').removeClass('active');
    	$('#other').removeClass('active');
    	$('#other-liquors').removeClass('active');
    	$('#mixers').removeClass('active');
    	$('#sparling').removeClass('active');
    	$('#american').removeClass('active');
    	$('#french').removeClass('active');
    	$('#imported-wine').removeClass('active');
    	$('#other-wine').removeClass('active');
    	switch (pageId) {
		case "scotch-all":
		    url = "/liquors/SCOTCH";
		    $('#scotch').addClass('active');
		    break;
		case "scotch-blended":
			url = "/specificLiquors/DOMESTIC SCOTCH,IMPORTED SCOTCH";
			$('#scotch').addClass('active');
			break;
		case "scotch-single":
			url = "/specificLiquors/SINGLE MALT SCOTCH";
			$('#scotch').addClass('active');
			break;
		case "vodka-all":
			url = "/liquors/VODKA";
			$('#vodka').addClass('active');
			break;
		case "vodka-domestic":
			url = "/specificLiquors/DOMESTIC VODKA,DOMESTIC VODKA FLAVORS";
			$('#vodka').addClass('active');
			break;
		case "vodka-imported":
			url = "/specificLiquors/IMPORTED VODKA,IMPORTED VODKA FLAVORS";
			$('#vodka').addClass('active');
			break;
		case "rum":
			url = "/liquors/RUM";
			break;
		case "whiskey":
			url = "/liquors/WHISKEY";
			break;
		case "tequila":
			url = "/liquors/TEQUILA";
			break;
		case "gin":
			url = "/liquors/GIN";
			break;
		case "other-liquors":
			url = "/liquors/OTHER_LIQUORS";
			$('#other').addClass('active');
			break;
		case "mixers":
			url = "/liquors/MIXERS";
			$('#other').addClass('active');
			break;
		case "sparling":
			url = "/liquors/SPARKLING_WINE";
			$('#other').addClass('active');
			break;
		case "american":
			url = "/liquors/AMERICAN_WINE";
			$('#other').addClass('active');
			break;
		case "french":
			url = "/liquors/FRENCH_WINE";
			$('#other').addClass('active');
			break;
		case "imported-wine":
			url = "/liquors/IMPORTED_WINE";
			$('#other').addClass('active');
			break;
		case "other-wine":
			url = "/liquors/OTHER_WINE";
			$('#other').addClass('active');
			break;
		}
		$('#'+pageId).addClass('active');
    	$('#liquorprices-menu').removeClass('in');
    	this.transitionToRoute(url);
    }
  }
});
