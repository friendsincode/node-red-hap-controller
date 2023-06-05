module.exports = function (RED) {
  const { HttpClient, IPDiscovery } = require('hap-controller');
  const discovery = new IPDiscovery();
  function DeviceNode(config) {
    let selectionCriteria = JSON.parse(config.selectionCriteria);
    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);
    // this.status({ fill: "red", shape: "dot", text: "Not Found" });
    SetDevStatus();
    var seconds = 15, the_interval = seconds * 1000;
    setInterval(async () => {
      if (selectionCriteria.id) {
        SetDevStatus(selectionCriteria);
      }
    }, the_interval);

    discovery.on('serviceUp', async (service) => {
      var devices = filterDevices(service);
      if (devices[0] != null) {
        let currentDevice = devices[0];
        await SetDevStatus(currentDevice);
      }
    });
    discovery.on('serviceDown', async (service) => {
      var devices = filterDevices(service);
      if (devices[0] != null) {
        let currentDevice = devices[0];
        await SetDevStatus(currentDevice);
      }
    });
    discovery.on('serviceChanged', async (service) => {
      var devices = filterDevices(service);
      if (devices[0] != null) {
        let currentDevice = devices[0];
        await SetDevStatus(currentDevice);
      }
    });
    async function SetDevStatus(currentDevice) {
      let devList = discovery.list();
      let item_exist = devList.some(item => item.id == selectionCriteria.id)
      let item = devList.filter(item => item.id == selectionCriteria.id)[0]
      if (item_exist) {
        node.status({ fill: "orange", shape: "dot", text: "Found" });
        if (item.availableToPair) {
          node.status({ fill: "yellow", shape: "dot", text: "Ready to pair." });
        }
        let ppdata = await node.PairingDataDB.GetData(item.id);
        if (!item.availableToPair && !(ppdata)) {
          node.status({ fill: "blue", shape: "dot", text: "Not paired\nDevice reset needed." });
        }
        if (!item.availableToPair && (ppdata)) {
          node.status({ fill: "green", shape: "dot", text: "paired" });
        }
      }
      else {
        node.status({ fill: "red", shape: "dot", text: "Not Found" });
      }
    }
    discovery.start();

    // Handle incoming messages with list of deivces in array.
    node.on('input', async function (msg) {
      if (msg.payload == null)
        msg.payload = {};
      let devList = discovery.list();
      let item_exist = devList.some(item => item.id == selectionCriteria.id);
      let item = devList.filter(item => item.id == selectionCriteria.id);
      if (item_exist)
        msg.payload.HomeKitAccessory = item[0];
      msg.payload.pairingPin = config.pairingPin;
      msg.payload.pairingData = await this.PairingDataDB.GetData(selectionCriteria.id);
      node.send(msg);
    });
    node.on('close', function () {
      // Perform cleanup tasks or additional closing logic here
      // This function is executed when the node is removed from the flow
      discovery.stop();
      // Example: Clean up resources, close connections, etc.
      this.log('Deivce node closing...');

      // Perform any necessary cleanup tasks before the node is closed
    });
    function filterDevices(ldevices) {
      if (!Array.isArray(ldevices)) {
        ldevices = [ldevices];
      }
      return ldevices.filter(device => {
        return (
          (selectionCriteria.serial ? device.serial.toLowerCase() === selectionCriteria.serial.toLowerCase() : true) &&
          (selectionCriteria.name ? device.name.toLowerCase() === selectionCriteria.name.toLowerCase() : false)
        );
      });
    }
  }
  RED.nodes.registerType("homekit-device", DeviceNode);

}