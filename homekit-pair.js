module.exports = function (RED) {
  function HomekitPairingNode(config) {
    const { HttpClient, IPDiscovery } = require('hap-controller');
    const discovery = new IPDiscovery();

    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);

    // Handle incoming messages with list of deivces in array.
    node.on('input', async function (msg) {

      let HomeKitAccessory = msg.payload.HomeKitAccessory;
      let service = HomeKitAccessory
      if (service != null) {
        if (service.availableToPair) {
          try {
            pin = msg.payload.pairingPin;
            //run pair
            const pairMethod = await discovery.getPairMethod(service);
            const client = new HttpClient(service.id, service.address, service.port);
            await client.pairSetup(pin, pairMethod);
            let pairingData = await client.getLongTermData();
            client.close();
            //Save Pairing Data to JSON DB
            console.log(`${service.id}: ${pairingData}`)
            await this.PairingDataDB.SaveData(service.id,
              {
                id: service.id,
                name: service.name,
                pairingData: pairingData
              });
            //update msg
            msg.payload.pairingData = pairingData
            let pairingDataOutputMsg = {
              msg: {
                id: service.id,
                name: service.name,
                pairingData: pairingData
              }
            }
            node.send([msg, pairingDataOutputMsg, null]);
          } catch (e) {
            console.error(`${service.name}: `, e);
            node.send([null, null, e]);
          }
        } else {
          var sendMsg = { payload: { error: "Can't pair accessory. It is already paired with a HomeKit controller.", device: (service) } }
          node.send(null, sendMsg);
        }
      }
    });

  }

  // Register the node type
  RED.nodes.registerType("homekit-pair", HomekitPairingNode);
};