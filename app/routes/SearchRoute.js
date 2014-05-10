'use strict';

module.exports = App.SearchRoute = Ember.Route.extend({
  templateName: 'liquors',
  model: function(params) {
  	var liquors = this.store.find('liquor',{searchString:params.searchstring, limit:0});
    return liquors;
  }
});