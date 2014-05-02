'use strict';

module.exports = App.DataTableView = Ember.View.extend({
  data: function(emberLiquors){
    var liquors = [];
    emberLiquors.forEach(function(liquor){
      liquors.push({
        description: liquor.get('description'),
        price: liquor.get('price'),
        size: liquor.get('size'),
        saleprice: 0,
        saleenddate: 0,
        category: liquor.get('category')
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
      "aoColumns": [
          { "mData": "description", "sTitle": "Description"},
          { "mData": "price", "sTitle": "Price" },
          { "mData": "size", "sTitle": "Size" },
          { "mData": "saleprice", "sTitle": "Sale Price" },
          { "mData": "saleenddate", "sTitle": "Sale End" },
          { "mData": "category", "sTitle": "Category" }
      ]
    });
  }
});