module.exports = function(RED) {
    function PairingDataNode(n) {
        const { Level } = require('level');

        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.DBName = n.DBName;

        const db = new Level(`./HomeKitPairingData/${this.DBName}`);
        this.SaveData = async function(DeviceID, PairingData) {
            // await db.open();
            // await db.put(DeviceID,PairingData);
        };
        this.GetData = async function(DeviceID){
            // await db.open();
            // return db.get(DeviceID);
        }
        this.RemoveData = async function(DeviceID){
            // await db.open();
            // await db.del(DeviceID);
        }
    }
    RED.nodes.registerType("homekit-pairing-data",PairingDataNode);
}