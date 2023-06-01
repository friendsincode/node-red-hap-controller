const { Console } = require('console');

module.exports = function (RED) {
  function PairRemoveNode(config) {
    const { HttpClient, IPDiscovery } = require('hap-controller');

    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);
    let selectionCriteria = JSON.parse(config.selectionCriteria);

    // Handle incoming messages
    node.on('input', async function (msg) {
      let devices = [];
      //data passed to node
      if (msg != null && msg.payload != null) {
        devices = filterDevices(msg.payload)
      } //data not passed to node
      else {
        devices = filterDevices(GetDeviceList());
      }
      let service = devices.length == 1 ? devices[0] : null;
      if (service != null) {
        if (!service.availableToPair) {
          try {
            let service = msg.payload;
            if (msg.payload.pairingData == null) {
              service.pairingData = await this.PairingDataDB.GetData(msg.payload.id);
            }
            //remove pairing data from device
            const client = new HttpClient(service.id, service.address, service.port, service.pairingData);
            await client.removePairing(client.pairingProtocol.iOSDevicePairingID);
            client.close();
            //remove pairing data from DB
            await this.PairingDataDB.RemoveData(service.id);
            //Update and send msg
            node.send([msg, null]);
          }
          catch (e) {
            console.error(`${msg.payload.name}:`, e);
            node.send[null, e];
          }
        }
        else {
          var sendMsg = { payload: { error: "Can't unpair accessory. It is already unpaired.", device: (service) } }
          node.send(null,sendMsg);
        }
      }
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

  // Register the node type
  RED.nodes.registerType("homekit-pair-remove", PairRemoveNode);
};
