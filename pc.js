/**
 * Created by freiheit on 14/03/11.
 */

/*
 Global Variables
 */
var map; // Google Maps
var marker; // Google Maps Marker

/*
  WebSocket
 */
var sock = new WebSocket('ws://frah.me:10080');
sock.onopen = function() {
  console.log('WebSocket connected: ws://frah.me:10080');
};
sock.onerror = function(ev) {
  console.log('WebSocket error: ');
  console.log(ev);
};
sock.onclose = function () {
  console.log('WebSocket connection closed');
};
sock.onmessage = function(ev) {
  console.log('WebSocket message received: ' + ev.data);
  try {
    var j = $.parseJSON(ev.data);
    switch (j.type) {
      case 1:
        $('#ws_id').text(j.id);
        break;
      case 2:
        $('#init_view').css('display', 'none');
        initMap(j.lat, j.lng);
        break;
    }
  } catch (e) {
    console.log(e);
    return;
  }
};

/*
 Google maps
 */
function initMap(lat, lng) {
  console.log('Initialize Google Maps API');
  var _mapCanvas = document.getElementById('map');
  _mapCanvas.style.height = document.documentElement.clientHeight + 'px';
  var _mapOptions = {
    center: new google.maps.LatLng(lat, lng),
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(_mapCanvas, _mapOptions);
  console.log('Google Maps initialize complete');
}
google.maps.event.addDomListener(window, "resize", function() {
  var _mapCanvas = document.getElementById('map');
  _mapCanvas.style.height = document.documentElement.clientHeight + 'px';
  var _center = map.getCenter();
  google.maps.event.trigger(map, "resize");
  map.setCenter(_center);
});
