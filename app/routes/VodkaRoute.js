'use strict';

module.exports = App.VodkaRoute = Ember.Route.extend({
  model: function() {
  	var liquors = this.store.find('liquor',{category:'IMPORTED VODKA,DOMESTIC VODKA,IMPORTED VODKA FLAVORS,DOMESTIC VODKA FLAVORS'});
    return liquors;
  }
});
