'use strict';

module.exports = App.DetailAlertsController = Ember.ObjectController.extend({
  emailAddress: '',
  price: true,
  stock: false,
  isNotInStock: function() {
    return this.get('content.status') !== 'IN STOCK';
  }.property('content.status'),
  actions: {
    alertSignUp: function(){
      var options = '';
      //dont sign up for stock alerts if its currently in stock
      if (this.get('content.status') === "IN STOCK"){
        this.set('stock',false);
      }
      if (this.get('emailAddress').match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)){
        $.ajax({
          type: "GET",
          url: 'addEmail/'+this.get('content.id')+'/'+this.get('emailAddress')+'?price='+this.get('price')+'&stock='+this.get('stock')
        }).done(function() {
          $('#bad-email-message').hide();
          $('#error-message').hide();
          $('#success-message').show();
          setTimeout(function(){$('#success-message').hide();}, 3000);
        })
        .fail(function() {
          $('#bad-email-message').hide();
          $('#error-message').show();
          setTimeout(function(){$('#error-message').hide();}, 3000);
        });
      }
      else {
        $('#bad-email-message').show();
      }
    }
  }
});
