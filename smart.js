/**
 * Created by freiheit on 14/03/11.
 */

var lat, lng;

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
    if (j.type >= 90) {
      alert(j.mes);
      return;
    }
    switch (j.type) {
      case 1:
        break;
      case 10:
        // pc ready
        $('#search_shop').removeAttr("disabled");
        break;
    }
  } catch (e) {
    console.log(e);
    return;
  }
};

/*
 Geolocation
 */
function doGeolocate() {
  if (navigator.geolocation) {
    var _geoOption = {
      enableHighAccuracy: true,
      timeout: 60000
    };
    navigator.geolocation.getCurrentPosition(
      function(loc) {
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        var d = {
          type: 30,
          id: $('#code_input').val(),
          lat: loc.coords.latitude,
          lng: loc.coords.longitude
        };
        sock.send(JSON.stringify(d));
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
        alert('現在地の取得に失敗しました\n' + _err_mes);
        return;
      }, _geoOption);
  } else {
    alert('現在地の取得ができません');
  }
}

$('#code_send').click(function(){
  doGeolocate();
});
$('#search_shop').click(function () {
  var d = {
    type: 31,
    lat: lat,
    lng: lng
  };
  sock.send(JSON.stringify(d));
});
$('#code_input').focus();
