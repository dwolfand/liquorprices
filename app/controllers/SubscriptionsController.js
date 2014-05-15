'use strict';

module.exports = App.SubscriptionsController = Ember.ObjectController.extend({
  account:undefined,
  actions: {
    removeSubscription: function(subscription) {
      console.log(this.get("account"));
      console.log(subscription.get("itemId"));
      $('.'+subscription.get("subscriptionType")+'-'+subscription.get("itemId")).modal('toggle');
      subscription.deleteRecord();
      subscription.save();
    }
  }
});