/**
 * Created by freiheit on 14/03/11.
 */

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

if (navigator.geolocation) {
  $('#latlng').text('positioning...');
  var _geoOption = {
    enableHighAccuracy: true,
    timeout: 60000
  };
  navigator.geolocation.getCurrentPosition(
    function(loc) {
      var _latlng = loc.coords.latitude + ', ' + loc.coords.longitude;
      $('#latlng').text(_latlng);
    }, function(err) {
      var _err_mes = '';
      switch (err.code) {
        case 1:
          _err_mes = '位置情報の利用が許可されていません';
          break;
        case 2:
          _err_mes = 'デバイスの位置が判定できません';
          break;
        case 3:
          _err_mes = 'タイムアウトしました';
          break;
      }
      $('#latlng').text(_err_mes);
    }, _geoOption);
}