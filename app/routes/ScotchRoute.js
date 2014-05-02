'use strict';

module.exports = App.ScotchRoute = Ember.Route.extend({
  model: function() {
  	var liquors = this.store.find('liquor',{category:'IMPORTED SCOTCH,DOMESTIC SCOTCH,SINGLE MALT SCOTCH'});
    return liquors;
  }
});
