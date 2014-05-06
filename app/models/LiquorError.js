'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.LiquorError = DS.Model.extend({
  itemChanged: attr(), 
  oldValue:attr(),
  newValue:attr(),
  changedDate:attr()
});