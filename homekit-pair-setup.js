module.exports = function (RED) {
  function PairSetupNode(config) {
    const { HttpClient, IPDiscovery } = require('hap-controller');
    const discovery = new IPDiscovery();

    RED.nodes.createNode(this, config);
    var node = this;
    this.PairingDataDB = RED.nodes.getNode(config.pairingData);
    // Handle incoming messages
    node.on('input', async function (msg) {
      service = msg.payload;      
      try {
        //format pin
        let pin = formatString(service.pin);
        //run pair
        const pairMethod = await discovery.getPairMethod(service);
        const client = new HttpClient(service.id, service.address, service.port);
        await client.pairSetup(pin, pairMethod);
        //get and save pairing data
        let pairingData = client.getLongTermData();
        client.close();
        this.PairingDataDB.SaveData(service.id,pairingData);
        //update msg
        msg.payload.pairingData=pairingData
        node.send([msg,pairingData,null]);
      } catch (e) {
        console.error(`${service.name}: `, e);
        node.send([null,null, e]);
      }
      node.send([msg,null,null]);
    });
  }

  // Register the node type
  RED.nodes.registerType("homekit-pair-setup", PairSetupNode);
};

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
    throw new Error("Invalid string format. Expected format: XXX-XX-XXX" + " " + input );
  }

  // Format the string as XXX-XX-XXX
  const formattedString = alphanumericString.replace(/(\w{3})(\w{2})(\w{3})/, "$1-$2-$3");
  return formattedString;
}
