'use strict';

module.exports = App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['redd', 'yellow', 'blue'];
  }
});
