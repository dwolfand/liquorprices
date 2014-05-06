'use strict';

module.exports = App.PriceTrendView = Ember.View.extend({
  roundUpToNearestTen: function(number){
    if (number < 10){
      return 10;
    }
    return Math.ceil(number / 10) * 10;;
  },
  roundDownToNearestTen: function(number){
    if (number < 10){
      return 0;
    }
    return Math.floor(number / 10) * 10;;
  },
  tagName:'div',
  didInsertElement: function(){
    var graphData = [];
    var liquor = this.get('content');
    var highestPrice = -1, lowestPrice = 10000000;

    liquor.get('sales').forEach(function(sale){
      if (parseFloat(sale.get('saleprice')) > highestPrice) {highestPrice = parseFloat(sale.get('saleprice'))}
      if (parseFloat(sale.get('saleprice')) < lowestPrice) {lowestPrice = parseFloat(sale.get('saleprice'))}
      //only show past sales not future - the current one if it exists will get included below
      if (new Date(sale.get('saleenddate')).getTime() < (new Date()).getTime()){
        graphData.push({'date':sale.get('saleenddate'),'saleprice':sale.get('saleprice')});
      }
    });

    liquor.get('liquorerrors').forEach(function(error){
      if (error.get('itemChanged')==='price'){
        if (parseFloat(error.get('oldValue')) > highestPrice) {highestPrice = parseFloat(error.get('oldValue'))}
        if (parseFloat(error.get('oldValue')) < lowestPrice) {lowestPrice = parseFloat(error.get('oldValue'))}
        graphData.push({'date':error.get('changedDate'),'normalprice':error.get('oldValue')});
      }
    });

    if (parseFloat(liquor.get('price')) > highestPrice) {highestPrice = parseFloat(liquor.get('price'))}
    if (parseFloat(liquor.get('price')) < lowestPrice) {lowestPrice = parseFloat(liquor.get('price'))}

    //set today's data point
    var today = {'date':new moment(new Date()).format(),'normalprice':liquor.get('price'),'saleprice':null};
    if (liquor.get('cursaleprice')){
      today.saleprice = liquor.get('cursaleprice');
    }
    graphData.push(today);

    //set original start price
    graphData.push({'date':liquor.get('createddate'),'normalprice':liquor.get('price')});

    //calculate y axis setters
    var ymax = 'auto '+this.roundUpToNearestTen(highestPrice);
    var ymin = 'auto '+this.roundDownToNearestTen(lowestPrice);

    Morris.Line({
      element: this.$().attr('id'),
      data: graphData,
      xkey: 'date',
      ykeys: ['saleprice','normalprice'],
      labels: ['Sale Price','Normal Price'],
      ymin: ymin,
      ymax: ymax,
      xLabelFormat: function(d) { return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); },
      yLabelFormat: function (y) { return y ? '$'+ y : ''},
      dateFormat: function (x) { return new moment(x).format('MM/DD/YYYY') }
    });
  }
});