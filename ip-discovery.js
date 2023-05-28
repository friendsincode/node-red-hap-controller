module.exports = function (RED) {
  const { IPDiscovery } = require('hap-controller');
  const discovery = new IPDiscovery();
  function DiscoveryNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    discovery.on('serviceUp', (service) => {
      msg={
        payload:{
        }
      }
      msg.payload=service;
      msg.payload.sender=discovery;
      node.send(msg);
      console.log('Found device:', service);
    });

    discovery.start();



    // Handle incoming messages
    node.on('input', function (msg) {
      // Perform the discovery logic here
      // You can use any discovery mechanism or libraryß

      msg.payload = {};

      // Send the message to the next node
      node.send(msg);
    });

    // Handle node closure
    node.on('close', function () {
      // Perform cleanup tasks or additional closing logic here
      // This function is executed when the node is removed from the flow
      discovery.stop();
      // Example: Clean up resources, close connections, etc.
      this.log('Discovery node closing...');

      // Perform any necessary cleanup tasks before the node is closed
    });
  }

  // Register the node type
  RED.nodes.registerType("ip-discovery", DiscoveryNode);
};
