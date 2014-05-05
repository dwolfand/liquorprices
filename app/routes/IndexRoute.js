'use strict';

module.exports = App.IndexRoute = Ember.Route.extend({
	model: function() {
		var liquors = this.store.find('liquor',{topsales:true,limit:30});
		return liquors;
	},
	setupController: function(controller, model) {
      this._super(controller, model);
      var liquors = {};
      var allLiquors = model.get("content");
      allLiquors.forEach(function(liquor){
      	if (!liquors[liquor.get("parentcategory")]){
      		liquors[liquor.get("parentcategory")] = [];
      	}
      	liquors[liquor.get("parentcategory")].push(liquor);
	  });
	  controller.set("liquors",liquors);
    }
});
