'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.Inventory = DS.Model.extend({
  name: attr(), 
  displayName:attr(),
  lat:attr(),
  lon:attr(),
  count:attr(),
  addr1:attr(),
  addr2:attr()
});