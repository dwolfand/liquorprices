'use strict';

module.exports = App.DataTableView = Ember.View.extend({
  templateName: 'data-table-view',
  data: function(emberLiquors){
    var liquors = [];
    emberLiquors.forEach(function(liquor){
      var enddate=liquor.get('cursaleenddate'),
        discount = liquor.get('discount');
      liquors.push({
        description: '<a href="#/detail/'+liquor.get('id')+'">'+liquor.get('description')+'</a>',
        price: liquor.get('price'),
        size: liquor.get('size'),
        cursaleprice: liquor.get('cursaleprice'),
        cursaleenddate: enddate ? new moment.utc(enddate).format('MMMM Do YYYY') : null,
        category: liquor.get('category'),
        discount: discount ? discount.toFixed(2)+"%" : null
      });
    });
    return liquors;
  },
  didInsertElement: function(){
    var self = this;
    console.log("rendering liquor datatable");
    $('#data-table-container').dataTable( {
      "bProcessing": true,
      "aaData":this.data(this.get('content')),
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
          { "mData": "discount", "sTitle": "Discount" }
      ]
    });
  },
  myObserver: function(){
      this.rerender();
    }.observes('context.model')
});