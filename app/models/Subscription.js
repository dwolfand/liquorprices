'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.Subscription = DS.Model.extend({
  size: attr(),
  imgsrc: attr(),
  longdescription: attr(),
  parentcategory: attr()
});