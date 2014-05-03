'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.Liquor = DS.Model.extend({
  description: attr(),
  size: attr(),
  price: attr(),
  category: attr(),
  imgsrc: attr(),
  longdescription: attr(),
  status: attr(),
  cursaleprice: attr(),
  cursaleenddate: attr(),
  lastUpdated: attr(),
  createddate: attr()
});