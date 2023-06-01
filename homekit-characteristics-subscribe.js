module.exports = function (RED) {
    function homekitCharacteristicsSubscribeNode(config) {
        
    }
    RED.nodes.registerType("homekit-characteristics-subscribe", homekitCharacteristicsSubscribeNode);
}


discovery.on('serviceUp', async (service) => {
    if (service.name != "Mysa-b20ca4")
      return;
    console.log(`Found device: ${service.name}`);
  
    const client = new HttpClient(service.id, service.address, service.port, pairingData, {
      usePersistentConnections: true,
    });
  
    let count = 0;
    client.on('event', async (ev) => {
      console.log(`Event: ${JSON.stringify(ev, null, 2)}`);
  
      if (++count >= 2) {
        // try {
        //   await client.unsubscribeCharacteristics(characteristics);
        //   client.close();
        //   console.log(`${service.name}: Unsubscribed!`);
        // } catch (e) {
        //   console.error(`${service.name}:`, e);
        // }
      }
    });
  
    client.on('event-disconnect', (formerSubscribes) => {
      console.log(`Disconnected: ${JSON.stringify(formerSubscribes, null, 2)}`);
  
      // resubscribe if wanted:
      // await client.subscribeCharacteristics(formerSubscribes);
    });
  
    try {
      await client.subscribeCharacteristics(characteristics);
      console.log(`${service.name}: Subscribed!`);
    } catch (e) {
      console.error(`${service.name}:`, e);
    }
  });
  
  discovery.start();