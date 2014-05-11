'use strict';

module.exports = (function() {
  App.DetailRoute = Ember.Route.extend({
	  model: function(params) {
	  	var liquor = this.store.find('liquorDetail', parseInt(params.liquor_id));
	    return liquor;
	  }
  });

  App.DetailIndexRoute = Ember.Route.extend({
    templateName: 'detail-index'
  });

  App.DetailInventoryRoute = Ember.Route.extend({
    templateName: 'detail-inventory'
  });

  App.DetailMapRoute = Ember.Route.extend({
    templateName: 'detail-map'
  });

  App.DetailPriceRoute = Ember.Route.extend({
    templateName: 'detail-price'
  });

  App.DetailAlertsRoute = Ember.Route.extend({
    templateName: 'detail-alerts'
  });

}());

