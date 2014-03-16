/**
 * Created by freiheit on 14/03/11.
 */
if (!('console' in window)) {
  window.console = {};
  window.console.log = function(str) { return str; };
}
String.prototype.htmlEscape = function() {
  var obj = document.createElement('div');
  if (typeof obj.textContent != 'undefined') {
    obj.textContent = this;
  } else {
    obj.innerText = this;
  }
  return obj.innerHTML;
};
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c)] });
};
String.prototype.tmpl = function(datas) {
  var str = this;
  for (var i in datas) {
    str = str.replace('{'+i+'}', datas[i]);
  }
  return str;
};

/*
  Check UA (init method)
 */
function checkUA() {
  var _UA = navigator.userAgent;
  if (
  //判別条件start
    (_UA.indexOf('iPhone') !== -1) //iphoneか、
      || ((_UA.indexOf('Android') !== -1) && (_UA.indexOf('Mobile') !== -1)) //またはAndroidMobile端末、
      || (_UA.indexOf('Windows Phone') !== -1) //またはWindowsPhone、
      || (_UA.indexOf('BlackBerry') !== -1) //またはBlackBerryの場合
  //判別条件end
) {
    // smartphone
    console.log('Access from Smartphone');
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "smart.js";
    document.body.appendChild(script);
  } else {
    // PC
    console.log('Access from PC. Load Google Maps');
    loadMapScript();
  }

}
window.onload = checkUA;

function initialize() {
  console.log('Loading Google Maps API complete. Load main script.');
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "pc.js";
  document.body.appendChild(script);
}
function loadMapScript() {
  console.log('loading google maps api')
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.google.com/maps/api/js?sensor=false&language=ja&callback=initialize";
  document.body.appendChild(script);
}

