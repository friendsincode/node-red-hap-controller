const { HttpClient, IPDiscovery } = require('hap-controller');
const { subsituteData } = require('./homekit-data.js');

module.exports = function (RED) {
    function AccessoriesGetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', async function (msg) {
            let service = msg.payload.HomeKitAccessory;
            let pairingData = msg.payload.pairingData.pairingData;
            const client = new HttpClient(service.id, service.address, service.port, pairingData, {
                usePersistentConnections: true,
            });

            try {
                let acc = await client.getAccessories();
                acc = subsituteData(acc);
                console.log(JSON.stringify(acc,null,2));
                msg.payload.data = acc
                await node.send(msg);
            } catch (e) {
                console.error(`${service.name}:`, e);
            }
            client.close();
        });
    }
    RED.nodes.registerType("homekit-accessories-get", AccessoriesGetNode);
}

