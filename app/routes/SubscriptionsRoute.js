'use strict';

module.exports = App.SubscriptionsRoute = Ember.Route.extend({
  model: function(params) {
  	var emailSubscriptions = this.store.find('emailSubscription',params.account);
    return emailSubscriptions;
  },

  setupController: function(controller, model) {
      //first pass in the model to the controller to set it up
      this._super(controller, model);
	  controller.set("account",model.id);
  }
});