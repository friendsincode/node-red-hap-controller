module.exports = function (RED) {
  function DeviceNode(config) {
    const { HttpClient, IPDiscovery } = require('hap-controller');
    const discovery = new IPDiscovery();
    let currentDevice = {};
    let selectionCriteria = JSON.parse(config.selectionCriteria);
    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);
    this.status({fill:"red",shape:"dot",text:"Not Found"});

    discovery.on('serviceUp', async (service) => {
      var devices = filterDevices(service);
      if (devices[0] != null) {
        currentDevice = devices[0];
        this.status({fill:"green",shape:"dot",text:"Found"});
      }
    });
    discovery.start();
    // Handle incoming messages with list of deivces in array.
    node.on('input', async function (msg) {
      if(msg.payload == null)
        msg.payload = {};
      msg.payload.HomeKitAccessory = currentDevice;
      msg.payload.pairingPin = config.pairingPin;
      msg.payload.pairingData = await this.PairingDataDB.GetData(currentDevice.id);
      node.send(msg);
    });
    node.on('close', function () {
      // Perform cleanup tasks or additional closing logic here
      // This function is executed when the node is removed from the flow
      discovery.stop();
      // Example: Clean up resources, close connections, etc.
      this.log('Discovery node closing...');

      // Perform any necessary cleanup tasks before the node is closed
    });
    function filterDevices(ldevices) {
      if (!Array.isArray(ldevices)) {
        ldevices = [ldevices];
      }
      return ldevices.filter(device => {
        return (
          (selectionCriteria['mac-address'] ? device.id.toLowerCase() === selectionCriteria['mac-address'].toLowerCase() : true) &&
          (selectionCriteria.serial ? device.serial.toLowerCase() === selectionCriteria.serial.toLowerCase() : true) &&
          (selectionCriteria.name ? device.name.toLowerCase() === selectionCriteria.name.toLowerCase() : false)
        );
      });
    }
  }
  RED.nodes.registerType("homekit-device", DeviceNode);

}