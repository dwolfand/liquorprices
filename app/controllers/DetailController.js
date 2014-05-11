'use strict';

module.exports = App.DetailController = Ember.ObjectController.extend({
  actions: {
    toggle_side_nav: function() {
      $('.row-offcanvas').toggleClass('active');
      var button = $('.btn-primary');
      if (button.html() === '&gt;&gt;'){
      	button.html('&lt;&lt;');
      } else {
      	button.html('&gt;&gt;');
      }
    },
    gotopage: function(pageId) {
      $('.row-offcanvas').removeClass('active');
      var url='';
      $('#details').removeClass('active');
      $('#price').removeClass('active');
      $('#inventory').removeClass('active');
      $('#map').removeClass('active');
      switch (pageId) {
      case "details":
        url = "/detail/"+this.get("content.id");
        break;
      case "price":
        url = "/detail/"+this.get("content.id")+"/price";
        break;
      case "inventory":
        url = "/detail/"+this.get("content.id")+"/inventory";
        break;
      case "map":
        url = "/detail/"+this.get("content.id")+"/map";
        break;
      }
      $('#'+pageId).addClass('active');
      $('#liquorprices-menu').removeClass('in');
      this.transitionToRoute(url);
    }
  }
});
