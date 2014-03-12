var http = require('http');
var util = require('util');
var WSServer = require('websocket').server;
var url = require('url');
var cons = {};
var cur_id = 0;

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
    switch (d.type) {
      case 30:
        var _d = {
          type: 2,
          lat: d.lat,
          lng: d.lng
        };
        cons[d.id].send(JSON.stringify(_d));
        break;
    }
  })
  socket.on('close', function (reason, desc) {
    log('Disconnected -> {0} [{1}] ({2})'.format(this.remoteAddress, id, desc));
    cons[id] = null;
  });
});
