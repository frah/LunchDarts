/**
 * Created by freiheit on 14/03/11.
 */

var lat, lng;
var ac = 0, acg = 0, prev_ac = 0;
var i_throw;

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
      $('#code_send').removeAttr('disabled');
      return;
    }
    switch (j.type) {
      case 1:
        break;
      case 10:
        // pc ready
        $('#menu').slideUp('fast');
        $('#darts').slideDown('fast', function(){
          ac = 0; acg = 0; prev_ac = 0;
          window.addEventListener('devicemotion', motionCap);
          i_throw = setInterval(throwDart, 100);
        });
        break;
    }
  } catch (e) {
    console.log(e);
    return;
  }
};

/*
 Darts
 */
function motionCap(e) {
  var filter_v = 0.1;

  // lowpass filter
  prev_ac = ac;
  ac = (e.acceleration.y * filter_v) + (ac * (1.0 - filter_v));
  acg = (e.accelerationIncludingGravity.x * filter_v) + (acg * (1.0 - filter_v));
}
function throwDart() {
  var g_threshold = 5.0;
  var a_threshold = -0.20;
  if (Math.abs(acg) < g_threshold) {
    return;
  }
  var delta = ac - prev_ac;
  console.log('ac: {0}, prev_ac: {1}, delta: {2}'.format(ac, prev_ac, delta));
  if (delta < a_threshold) {
    console.log('Throw!');
    var d = {
      type: 31,
      lat: lat,
      lng: lng
    };
    clearInterval(i_throw);
    window.removeEventListener('devicemotion', motionCap);
    sock.send(JSON.stringify(d));
    $('#darts').animate({
      marginTop: '-{0}px'.format($('#darts > img').height())
    }, "fast", "swing", function(){
      $('#darts').css('display', 'none');
    });
  }
}

/*
 Geolocation
 */
function doGeolocate() {
  if (navigator.geolocation) {
    var _geoOption = {
      enableHighAccuracy: true,
      timeout: 30000
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
        $('#code_send').removeAttr('disabled');
        return;
      }, _geoOption);
  } else {
    alert('現在地の取得ができません');
    $('#code_send').removeAttr('disabled');
  }
}

$('#code_send').click(function(){
  $(this).attr('disabled', 'disabled');
  doGeolocate();
});
