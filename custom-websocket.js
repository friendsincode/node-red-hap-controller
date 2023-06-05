module.exports = function (RED) {


  // Keep track of connected sockets
  var connectedSockets = [];
  const { IPDiscovery } = require('hap-controller');
  var discovery = new IPDiscovery();
  discovery.start();
  function CustomWebSocketNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
  }

  // RED.nodes.registerType("custom-websocket", CustomWebSocketNode);

  RED.httpAdmin.get('/hap-controller/list-devices', RED.auth.needsPermission('hb-event.read'), function (req, res) {
    let devs = discovery.list();
    res.send(JSON.stringify(devs));
  });
};
