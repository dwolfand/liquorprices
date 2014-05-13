'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.EmailSubscription = DS.Model.extend({
  priceSubscriptions = hasMany('subscription'),
  stockSubscriptions = hasMany('subscription')
});