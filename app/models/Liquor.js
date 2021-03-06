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
  imageUrl: function() {
    return "http://www2.montgomerycountymd.gov/dlcsearch/"+this.get("imgsrc").replace("_thumb","_large");
  }.property('imgsrc'),
  longdescription: attr(),
  status: attr(),
  cursaleprice: attr(),
  cursaleenddate: attr(),
  lastUpdated: attr(),
  createddate: attr(),
  discount: attr(),
  parentcategory: attr()
});