module.exports = function (RED) {
    const { GattClient, HttpClient } = require('hap-controller');
    function IdentifyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.discoveryMode = "";
        node.on('input', function (msg) {
            this.discoveryMode = msg.discoveryMode;
            switch (this.discoveryMode) {
                case "IP":
                    const ipClient = new HttpClient(msg.payload.id, msg.payload.address, msg.payload.port);
                    ipClient.identify().then(() => {
                        console.log("identify done");
                    }).catch((e) => console.error(e));
                    break;
                case "Bluetooth":
                    const bleClient = new GattClient(msg.payload.id, msg.payload.peripheral);
                    bleClient.identify().then(() => {
                        console.log("identify done");
                    }).catch((e) => console.error(e));
                    break;
            }

            // msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }
    RED.nodes.registerType("homekit-identify", IdentifyNode);
}