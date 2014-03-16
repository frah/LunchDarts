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
      case 3:
        var shop = j.data;
        if (marker === void 0) {
          var lnglat = shop.Geometry.Coordinates.split(',');
          var to = new google.maps.LatLng(lnglat[1], lnglat[0]);
          map.panTo(to);
          smoothZoom(map, 18, map.getZoom(), true);
          setTimeout(function(){putMarker(map, to, shop);}, 2000);
        }
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

  // drop pin (for debug)
  /*
  setTimeout(function(){
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: map,
      draggable: false,
      animation: google.maps.Animation.DROP
    });
  }, 1000);
  */
  setTimeout(function () {
    map.panTo(new google.maps.LatLng(38.26572, 136.23100));
    smoothZoom(map, 5, map.getZoom(), false);
  }, 2000);

  var d = {
    type: 20,
    mes: "ready"
  };
  sock.send(JSON.stringify(d));

  console.log('Google Maps initialize complete');
}
function putMarker (map, latlng, dat) {
  console.log('putMarker('+map+','+latlng+',dat')

  marker = new google.maps.Marker({
    map:map,
    draggable:false,
    animation: google.maps.Animation.DROP,
    position: latlng,
    icon: new google.maps.MarkerImage(
      'darts.png',                     // url
      new google.maps.Size(98,96), // size
      new google.maps.Point(0,0),  // origin
      new google.maps.Point(98,96) // anchor
    )
  });
  var infos = {
    Name: dat.Name,
    Address: dat.Property.Address,
    TEL: dat.Property.Tel1,
    Image: dat.Property.LeadImage || ""
  };
  console.log(infos);
  info = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(0, 20),
    content: $("#infoWindowTemplate").html().tmpl(infos),
    maxWidth: 400
  });
  setTimeout(function(){info.open(map, marker);}, 500);
}
function smoothZoom (map, level, cnt, mode) {
  // If mode is zoom in
  if(mode == true) {
    if (cnt >= level) {
      return;
    }
    else {
      var z = google.maps.event.addListener(map, 'zoom_changed', function(event){
        google.maps.event.removeListener(z);
        smoothZoom(map, level, cnt + 1, true);
      });
      setTimeout(function(){map.setZoom(cnt)}, 80);
    }
  } else {
    if (cnt <= level) {
      return;
    }
    else {
      var z = google.maps.event.addListener(map, 'zoom_changed', function(event) {
        google.maps.event.removeListener(z);
        smoothZoom(map, level, cnt - 1, false);
      });
      setTimeout(function(){map.setZoom(cnt)}, 80);
    }
  }
}
google.maps.event.addDomListener(window, "resize", function() {
  var _mapCanvas = document.getElementById('map');
  _mapCanvas.style.height = document.documentElement.clientHeight + 'px';
  var _center = map.getCenter();
  google.maps.event.trigger(map, "resize");
  map.setCenter(_center);
});
