'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.Subscription = DS.Model.extend({
  itemId: attr(),
  size: attr(),
  imgsrc: attr(),
  imageUrl: function() {
    return "http://www2.montgomerycountymd.gov/dlcsearch/"+this.get("imgsrc");
  }.property('imgsrc'),
  bgImageStyle: function() {
    return "background-image:url('http://www2.montgomerycountymd.gov/dlcsearch/"+this.get("imgsrc").replace("_thumb","_large")+"');";
  }.property('imgsrc'),
  detailUrl: function() {
    return "#/detail/"+this.get("itemId");
  }.property('itemId'),
  longdescription: attr(),
  parentcategory: attr(),
  subscriptionType: attr()
});