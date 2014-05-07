'use strict';

module.exports = App.DataTableView = Ember.View.extend({
  templateName: 'data-table-view',
  data: function(emberLiquors){
    var liquors = [];
    emberLiquors.forEach(function(liquor){
      var enddate=liquor.get('cursaleenddate'),
        discount = liquor.get('discount');
      if (new moment(enddate).diff(new moment(), 'days') < 0)
        enddate = null;
      liquors.push({
        description: '<a href="#/detail/'+liquor.get('id')+'">'+liquor.get('description')+'</a>',
        price: "$" + liquor.get('price'),
        size: liquor.get('size'),
        cursaleprice: liquor.get('cursaleprice') ? "$"+liquor.get('cursaleprice') : null,
        cursaleenddate: enddate ? new moment.utc(enddate).format('MMMM Do YYYY') : null,
        saledaysleft: enddate ? (new moment(enddate).diff(new moment(), 'days'))+" Days Left" : null,
        savings: enddate ? "$"+(liquor.get('price') - liquor.get('cursaleprice')).toFixed(2) : null,
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
      "aaSorting": [[ 4, "desc" ]],
      "aoColumns": [
          { "mData": "description", "sTitle": "Description"},
          { "mData": "size", "sTitle": "Size" },
          { "mData": "price", "sTitle": "Orig Price" },
          { "mData": "cursaleprice", "sTitle": "Sale Price" },
          { "mData": "savings", "sTitle": "Savings" },
          { "mData": "discount", "sTitle": "Discount" },
          { "mData": "saledaysleft", "sTitle": "Days Left" }
      ]
    });
  },
  myObserver: function(){
      this.rerender();
    }.observes('context.model')
});