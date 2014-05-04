'use strict';

module.exports = App.IndexRoute = Ember.Route.extend({
	model: function() {
		var liquors = this.store.find('liquor',{topsales:true,limit:30});
		return liquors;
	}
});
