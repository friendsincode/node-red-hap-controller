module.exports = function (RED) {
    function PairListNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;
      // Handle incoming messages
      node.on('input', function (msg) {
        // Send the message to the next node
        node.send(msg);
      });
    }
  
    // Register the node type
    RED.nodes.registerType("homekit-pair-list", PairListNode);
  };
  