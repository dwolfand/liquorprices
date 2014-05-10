'use strict';

module.exports = App.ApplicationController = Ember.Controller.extend({
  searchstring:'',
  actions: {
    search: function() {
      if (this.searchstring.length < 3){
      	alert("Please make your search at least 3 letters");
      }else{
      	this.transitionToRoute("/search/"+this.searchstring);
      }
    }
  }
});
