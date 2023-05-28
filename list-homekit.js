module.exports = function (RED) {
    const { IPDiscovery } = require('hap-controller');
    const discovery = new IPDiscovery();
    function listHomekitNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      discovery.start();
      // Handle incoming messages
      node.on('input', function (msg) {
        // Perform the discovery logic here
        // You can use any discovery mechanism or libraryß
        var yy = msg.payload.sender.list();
        msg.payload = yy;
  
        // Send the message to the next node
        node.send(msg);
      });
    }
  
    // Register the node type
    RED.nodes.registerType("list-homekit", listHomekitNode);
  };
  