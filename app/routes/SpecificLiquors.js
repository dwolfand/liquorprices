'use strict';

module.exports = App.SpecificLiquorsRoute = Ember.Route.extend({
  templateName: 'liquors',
  model: function(params) {
  	console.log("refreshing specific liquor model");
  	var liquors = this.store.find('liquor',{category:params.category, limit:0});
    return liquors;
  }
});
