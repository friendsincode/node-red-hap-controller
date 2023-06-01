module.exports = function (RED) {
  function HomekitPairingNode(config) {
    const { HttpClient, IPDiscovery } = require('hap-controller');
    const discovery = new IPDiscovery();

    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);

    // Handle incoming messages with list of deivces in array.
    node.on('input', async function (msg) {

      let selectionCriteria = JSON.parse(config.selectionCriteria);
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
        if (service.availableToPair) {
          try {
            service.pin = config.pairingPin;
            //format pin
            let pin = formatString(service.pin);
            //run pair
            const pairMethod = await discovery.getPairMethod(service);
            const client = new HttpClient(service.id, service.address, service.port);
            await client.pairSetup(pin, pairMethod);
            let pairingData = await client.getLongTermData();
            client.close();
            //Save Pairing Data to JSON DB
            console.log(`${service.id}: ${pairingData}`)
            await this.PairingDataDB.SaveData(service.id, pairingData);
            //update msg
            msg.payload.pairingData = pairingData
            let pairingDataOutputMsg = {
              msg: {
                id: service.id,
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
          node.send(null,sendMsg);
        }
      }

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
    });

  }

  // Register the node type
  RED.nodes.registerType("homekit-pair", HomekitPairingNode);

  async function GetDeviceList() {
    const { IPDiscovery } = require('hap-controller');

    const discovery = new IPDiscovery();

    discovery.start();
    return discovery.list();
  }
  function formatString(input) {
    // Check if the input is a string
    input = String(input);
    if (typeof input !== 'string') {
      throw new Error("Invalid input. Expected a string.");
    }

    // Remove all non-alphanumeric characters from the input
    const alphanumericString = input.replace(/\W/g, '');

    // Check if the resulting string is of the expected length
    if (alphanumericString.length !== 8) {
      throw new Error("Invalid string format. Expected format: XXX-XX-XXX" + " " + input);
    }

    // Format the string as XXX-XX-XXX
    const formattedString = alphanumericString.replace(/(\w{3})(\w{2})(\w{3})/, "$1-$2-$3");
    return formattedString;
  }
};