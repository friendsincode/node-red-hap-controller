module.exports = function (RED) {
    const { GattClient, HttpClient } = require('hap-controller');
    function IdentifyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.discoveryMode = "";
        node.on('input', function (msg) {
            let device = msg.payload.HomeKitAccessory;
            if (device.availableToPair) {
                const ipClient = new HttpClient(device.id, device.address, device.port);
                ipClient.identify().then(() => {
                    console.log("identify done");
                }).catch((e) => console.error(e));
            }
            // msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }
    RED.nodes.registerType("homekit-identify", IdentifyNode);
}