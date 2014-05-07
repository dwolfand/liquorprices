'use strict';

module.exports = App.LiquorsRoute = Ember.Route.extend({
  model: function(params) {
  	console.log("refreshing liquor model");
  	var liquors = this.store.find('liquor',{parentcategory:params.category, limit:0});
    return liquors;
  }
});
