'use strict';

module.exports = App.DetailRoute = Ember.Route.extend({
  model: function(params) {
  	var liquor = this.store.find('liquorDetail', parseInt(params.liquor_id));
    return liquor;
  }
});
