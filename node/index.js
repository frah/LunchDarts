var http = require('http');
var util = require('util');
var WSServer = require('websocket').server;
var url = require('url');
var request = require('request');
var cons = {};
var bind = {};
var cur_id = 0;
var yAppID = "dj0zaiZpPTM5c2RvNWNoNTRBTyZzPWNvbnN1bWVyc2VjcmV0Jng9OTk-";

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c)] });
};
function log(text) {
  var now = new Date();
  var y = now.getFullYear();
  var m = ('0' + (now.getMonth() + 1)).slice(-2);
  var d = ('0' + now.getDate()).slice(-2);
  var H = ('0' + now.getHours()).slice(-2);
  var M = ('0' + now.getMinutes()).slice(-2);
  var S = ('0' + now.getSeconds()).slice(-2);
  console.log('{0}/{1}/{2} {3}:{4}:{5} - {6}'.format(y, m, d, H, M, S, text));
}

var plainHttpServer = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(clientHtml);
}).listen(10080);

var wss = new WSServer({
  httpServer: plainHttpServer,
  autoAcceptConnetions: false
});

function originIsAllowed(origin) {
  if (origin === 'frah.me') {
    return true;
  }
  return false;
}

function getShopData(soc, id, lat, lng) {
  var yLocalAPI = "http://search.olp.yahooapis.jp/OpenLocalPlatform/V1/localSearch" +
    "?appid={0}&output=json&lat={1}&lon={2}&dist=1&query=%E3%83%A9%E3%83%B3%E3%83%81" +
    "&sort=hybrid&open=now&loco_mode=true&results=100";
  var reqOpt = {
    url: yLocalAPI.format(yAppID, lat, lng),
    method: "GET",
    json: true
  };
  var ret = {
    type: 3,
    data: {}
  };
  request(reqOpt, function(err, resp, body) {
    if (!err && resp.statusCode == 200) {
      var rInfo = body.ResultInfo;
      if (rInfo.Status != 200) {
        log('API error: {0}'.format(body.Error.Message));
        ret.type = 91;
        ret.mes = 'API error: {0}'.format(body.Error.Message);
      } else if (rInfo.Count == 0) {
        log('API error: No results');
        ret.type = 92;
        ret.mes = 'Error: No results';
      } else {
        var index = Math.floor(Math.random() * rInfo.Count);
        ret.data = body.Feature[index];
      }
    } else {
      log('error: {0}'.format(resp.statusCode));
      ret.type = 93;
      ret.mes = 'Error: request response {0}'.format(resp.statusCode);
    }

    log('[{0}->{1}] Send: {2}'.format(id, bind[id], JSON.stringify(ret)));
    soc.send(JSON.stringify(ret));
    var tsoc = cons[id];
    if (tsoc !== void 0) {
      log('[{0}->{1}] Send: {2}'.format(bind[id], id, JSON.stringify(ret)));
      tsoc.send(JSON.stringify(ret));
    }
  });
}

wss.on('request', function (req) {
  req.origin = req.origin || "*";
  if (!originIsAllowed(url.parse(req.origin).hostname)) {
    req.reject();
    log('Connection from origin ' + req.origin + ' rejected.');
  }

  var socket = req.accept(null, req.origin);
  var id = ('000' + cur_id).slice(-4);
  if (++cur_id >= 10000) { cur_id = 0; }
  cons[id] = socket;
  var _d = {
    type: 1,
    id: id
  };
  socket.send(JSON.stringify(_d));
  log('Connected -> {0} [{1}]'.format(socket.remoteAddress, id));

  socket.on('message', function (mes) {
    log('[{0}] Received: {1}'.format(id, mes.utf8Data));
    var d = JSON.parse(mes.utf8Data);
    var tsoc;
    if (d.type === 30) {
      tsoc = cons[d.id];
    } else {
      tsoc = cons[bind[id]];
    }
    if (tsoc === void 0 || !tsoc.connected) {
      // no such specified connection id
      var ret = {
        type: 90,
        mes: "No such specified connection id"
      };
      log('[{0}] Send: {1}'.format(id, JSON.stringify(ret)));
      socket.send(JSON.stringify(ret));
      return;
    }
    switch (d.type) {
      case 20:
        var _d = {
          type: 10,
          mes: "PC ready"
        };
        log('[{0}->{1}] Send: {2}'.format(id, bind[id], JSON.stringify(_d)));
        tsoc.send(JSON.stringify(_d));
        break;
      case 30:
        var _d = {
          type: 2,
          lat: d.lat,
          lng: d.lng
        };
        log('[{0}->{1}] Send: {2}'.format(id, d.id, JSON.stringify(_d)));
        tsoc.send(JSON.stringify(_d));
        bind[id] = d.id;
        bind[d.id] = id;
        break;
      case 31:
        getShopData(tsoc, id, d.lat, d.lng);
        break;
    }
  })
  socket.on('close', function (reason, desc) {
    log('Disconnected -> {0} [{1}] ({2})'.format(this.remoteAddress, id, desc));
    cons[id] = void 0;
    bind[bind[id]] = void 0;
    bind[id] = void 0;
  });
});
