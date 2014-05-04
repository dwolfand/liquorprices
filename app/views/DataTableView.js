'use strict';

module.exports = App.DataTableView = Ember.View.extend({
  data: function(emberLiquors){
    var liquors = [];
    emberLiquors.forEach(function(liquor){
      var discount = "",enddate = "", saleprice = "";
      if (liquor.get('cursaleenddate')){
        enddate = new moment.utc(liquor.get('cursaleenddate')).format('MMMM Do YYYY');
        discount = (100 - ((liquor.get('cursaleprice')/liquor.get('price'))*100)).toFixed(3) + "%"
        saleprice = liquor.get('cursaleprice');
      }
      liquors.push({
        description: liquor.get('description'),
        price: liquor.get('price'),
        size: liquor.get('size'),
        cursaleprice: saleprice,
        cursaleenddate: enddate,
        category: liquor.get('category'),
        discount: discount
      });
    });
    return liquors;
  },
  tagName:'table',
  didInsertElement: function(){
    var self = this;
    console.log("rendering liquor datatable");
    this.$().dataTable( {
      "bProcessing": true,
      "aaData":this.data(this.get('content').content),
      "bLengthChange": false,
      "iDisplayLength": 200,
      "aaSorting": [[ 6, "desc" ]],
      "aoColumns": [
          { "mData": "description", "sTitle": "Description"},
          { "mData": "price", "sTitle": "Price" },
          { "mData": "size", "sTitle": "Size" },
          { "mData": "cursaleprice", "sTitle": "Sale Price" },
          { "mData": "cursaleenddate", "sTitle": "Sale End" },
          { "mData": "category", "sTitle": "Category" },
          { "mData": "discount", "sTitle": "Discount %" }
      ]
    });
  }
});