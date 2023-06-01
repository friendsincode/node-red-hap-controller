module.exports = function(RED) {
    function PairingDataNode(n) {
        const { JsonDB, Config } = require('node-json-db');

        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.DBName = n.DBName;
        var userDir = RED.settings.userDir;

        const db = new  JsonDB(new Config(`${userDir}/HomeKitPairingData/${this.DBName}`,true,true,'/'));
        this.SaveData = async function(DeviceID, PairingData) {
            await db.push(`/${DeviceID}`,PairingData);
        };
        this.GetData = async function(DeviceID){
            let data =  await db.getObjectDefault<Object>(`/${DeviceID}`,{});
             return data;
        }
        this.RemoveData = async function(DeviceID){
            await db.delete(`/${DeviceID}`);
        }
    }
    RED.nodes.registerType("homekit-pairing-data",PairingDataNode);
}