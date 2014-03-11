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
};

/*
 Google maps
 */
function initMap() {
  console.log('Initialize Google Maps API');
  var _mapCanvas = document.getElementById('map');
  _mapCanvas.style.height = document.documentElement.clientHeight + 'px';
  var _mapOptions = {
    center: new google.maps.LatLng(38.26572, 136.23100),
    zoom: 5,
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

initMap();
