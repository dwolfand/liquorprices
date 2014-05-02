'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.Sale = DS.Model.extend({
  saleprice: attr(),
  saleenddate: attr()
});