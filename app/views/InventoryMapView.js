'use strict';

module.exports = App.InventoryMapView = Ember.View.extend({
  templateName: 'inventory-map-view',
  openInfoWindow: undefined,
  buildContentString: function(location){
    var html = 
      '<div class = "map-balloon">'+
        '<div class = "map-balloon-name"><a target="_blank" href="http://maps.google.com/maps?q='+location.get('addr1')+", "+location.get('addr2')+'">'+location.get('displayName')+'</a><br/></div>'+
        // '<div class = "map-balloon-address">'+
        //   '123 Something Street<br/>'+
        //   'Bethesda, MD 20817<br/>'+
        // '</div>'+
        '<div class = "map-balloon-quantity">Quantity: '+location.get('count')+'</div>'+
      '</div>';

    return html;
  },
  setUpMarkers: function(locations, map, contentBuilder, openInfoWindow){
    locations.forEach(function(location){
      if (location.get('lat')){
        var infowindow = new google.maps.InfoWindow({
          content: contentBuilder(location)
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.get('lat'),location.get('lon')),
            map: map,
            title: location.get('displayName')
        });
        google.maps.event.addListener(marker, 'click', function() {
          if (openInfoWindow) {
            openInfoWindow.close();
          }
          openInfoWindow = infowindow;
          infowindow.open(map,marker);
        });
      } else {
        console.log("Error - couldn't map location: "+location.get('name')+", with inventory count of: "+location.get('count'));
      }
    });
  },
  didInsertElement: function(){
    console.log("rendering map");
    var locations = this.get('content').get('inventory');

    $("#map-canvas").css({ height: $("#map-canvas").width()});
    var mapOptions = {
      center: new google.maps.LatLng(39.136600,-77.204514),//moco center
      zoom: 10
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);

    this.setUpMarkers(locations, map, this.buildContentString, this.openInfoWindow);
  },
  myObserver: function(){
      this.rerender();
  }.observes('context.model')
});