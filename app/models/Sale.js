'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.Sale = DS.Model.extend({
  liquorDetail: belongsTo('liquorDetail'),
  saleprice: attr(),
  saleenddate: attr()
});