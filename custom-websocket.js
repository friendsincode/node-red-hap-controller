module.exports = function (RED) {
  function CustomWebSocketNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    var ws = require('ws');
    var wss = new ws.Server({ noServer: true });
    const { IPDiscovery, BLEDiscovery } = require('hap-controller');
    var discovery = new IPDiscovery();
    discovery.start();
    wss.on('connection', function (ws, request) {
      ws.on('message', function (message) {
        var data = JSON.parse(message);
        if (data.type == "DiscoverDevices") {
          var msg = { payload: message };
          var devs = discovery.list();
          let responseMSG= {
            devices:devs,
            type:"DeviceList"
          }
          ws.send(JSON.stringify(responseMSG));
          node.send(msg);
        } else {
          var msg = { payload: message };
          node.send(msg);
        }
      });
    });

    RED.server.on('upgrade', function (request, socket, head) {
      const pathname = new URL(request.url, 'http://localhost').pathname;

      if (pathname === '/test/123') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }
  RED.nodes.registerType("custom-websocket", CustomWebSocketNode);
}
