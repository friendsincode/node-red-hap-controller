const { Console } = require('console');

module.exports = function (RED) {
  function PairRemoveNode(config) {
    const { HttpClient, IPDiscovery } = require('hap-controller');

    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);

    // Handle incoming messages
    node.on('input', async function (msg) {
      service = msg.payload.HomeKitAccessory;
      if (service != null) {
        if (!service.availableToPair) {
          try {
            if (msg.payload.pairingData == null) {
              service.pairingData = await this.PairingDataDB.GetData(msg.payload.id).pairingData;
            }
            else {
              service.pairingData = msg.payload.pairingData.pairingData;
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
          node.send(null, sendMsg);
        }
      }
    });
  }

  // Register the node type
  RED.nodes.registerType("homekit-pair-remove", PairRemoveNode);
};
