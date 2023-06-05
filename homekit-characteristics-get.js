const { HttpClient, IPDiscovery } = require('hap-controller');
const { getNameByUUID } = require('./homekit-data.js');

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
                acc = subsatuteData(acc);
                console.log(JSON.stringify(acc,null,2));
                msg.payload.data = acc
                await node.send(msg);
            } catch (e) {
                console.error(`${service.name}:`, e);
            }
            client.close();
        });
    }
    RED.nodes.registerType("homekit-characteristic-get", CharacteristicGetNode);
}

function subsatuteData(data) {
    // console.log(JSON.stringify(data, null, 2))
    data.accessories.forEach(accessories => {
        accessories.services.forEach(service => {
            if (getNameByUUID(service.type)) {
                service.type = getNameByUUID(service.type)
            }
            service.characteristics.forEach(characteristic => {
                if (getNameByUUID(characteristic.type)) {
                    characteristic.type = getNameByUUID(characteristic.type)
                }
            });
        });
    });
    return data;
}