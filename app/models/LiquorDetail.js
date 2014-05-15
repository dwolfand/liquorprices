'use strict';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

module.exports = App.LiquorDetail = DS.Model.extend({
  description: attr(),
  size: attr(),
  price: attr(),
  pricePerMl: function() {
    var curSizeInMl;
    var curPrice;
    curPrice = this.get('cursaleprice') ? this.get('cursaleprice') : this.get('price');
    if (this.get('size').indexOf('ML')>0){
      curSizeInMl = this.get('size').replace('ML','');
    }else if (this.get('size').indexOf('L') === this.get('size').length-1){
      curSizeInMl = parseFloat(this.get('size').replace('L',''))*1000;
    }

    if (curSizeInMl){
      return '$'+(parseFloat(curPrice)/parseFloat(curSizeInMl)).toFixed(4);
    }
    return "N/A";
  }.property('imgsrc'),
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
  parentcategory: attr(),
  sales: hasMany('sale'),
  liquorerrors: hasMany('liquorError'),
  inventory: hasMany('inventory')
});