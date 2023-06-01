# HomeKit Node-RED Library Selection Criteria Documentation

The selection criteria object is a central component in the process of selecting and pairing a HomeKit device using our library. The object consists of four properties: `mac-address`, `id`, `serial`, and `name`. These properties allow for the precise selection and identification of the HomeKit device intended for pairing or interaction.

## Selection Criteria Properties

1. **mac-address:** This represents the Media Access Control (MAC) address of the device. It's a unique identifier assigned to the network interface of the device and follows the format `xx:xx:xx:xx:xx:xx`, where each 'x' is a hexadecimal digit. An example of a MAC address could be `00:14:22:01:23:45`. 

2. **id:** This is the HomeKit Pairing Identifier or Accessory Identifier for the device. This identifier is unique to each device and is essential in the HomeKit Accessory Protocol for establishing secure communications. This is typically a string of alphanumeric characters.

3. **serial:** This is the serial number of the HomeKit device. It's unique to each device and usually set by the manufacturer. This could be used as an additional means of identifying a specific device.

4. **name:** This is the human-friendly name of the device. This name may be assigned by the manufacturer, or it may be set by the user during the setup process. This name may be displayed in the user interface of HomeKit or our Node-RED library.

## Selection Process

When a new HomeKit device is being added in our library, the selection criteria object must be provided. The library will use these criteria to discover and identify the correct device on the local network. The MAC address and the Pairing Identifier are typically used for this purpose, as they provide a robust and secure method of identifying devices. The serial number and name can serve as additional identification or filtering mechanisms.

It's important to note that not all properties might be required for every operation. For instance, for pairing, the most crucial property is the Pairing Identifier (id). For sending commands or queries to an already paired device, the MAC address or id may be used.

Remember that these identifiers should be handled securely, as unauthorized access to this information could potentially allow unwanted access to the HomeKit devices.


The selection criteria properties you've specified (`mac-address`, `id`, `serial`, and `name`) can play a crucial role in the discovery and pairing process. Here's a detailed step-by-step guide on how these properties might be evaluated and used during discovery and pairing of a HomeKit device:

1. **Device Discovery:** The first step is the discovery of available HomeKit devices in the network. This process involves sending a multicast query over the local network using mDNS/Bonjour protocol. The devices respond to these queries with their details, including the device's `name`, `id`, `mac-address`, and `serial` number among other properties.

2. **Device Filtering:** Once the list of available devices is obtained, the next step is filtering based on the selection criteria provided. The library compares the details of each discovered device with the provided selection criteria:

    a. **MAC Address:** The library first checks if the `mac-address` of the device matches the one specified in the selection criteria. If it does, the device is selected for the next phase. If the `mac-address` in the criteria is empty, the library moves to the next criterion.
    
    b. **ID:** Next, the library checks the `id` (Pairing Identifier or Accessory Identifier) of the device. If it matches with the one specified in the selection criteria, the device is selected for the next phase. If the `id` in the criteria is empty, the library moves to the next criterion.

    c. **Serial:** The `serial` number of the device is checked next. If it matches with the one specified in the selection criteria, the device is selected for the next phase. If the `serial` in the criteria is empty, the library moves to the next criterion.

    d. **Name:** Finally, the library checks the `name` of the device. If it matches with the one specified in the selection criteria, the device is selected for pairing.

3. **Pairing:** Once the correct device has been identified based on the selection criteria, the pairing process is initiated. This involves the exchange of cryptographic keys and verification of the pairing code. The Pairing Identifier (`id`) plays a crucial role in this step to establish secure communication.

The order (`mac-address`, `id`, `serial`, and `name`) allows for the refinement of the selection process from the most secure and unique identifier (`mac-address`) to the most human-friendly identifier (`name`). This helps ensure that the correct device is selected, even in complex network environments with multiple HomeKit devices.


```Javascript

// Array of discovered devices (Replace with actual device discovery results)
let devices = [
    { mac_address: '00:00:00:00:00:00', id: 'id1', serial: 'serial1', name: 'Device1' },
    { mac_address: '00:00:00:00:00:01', id: 'id2', serial: 'serial2', name: 'Device2' },
    // ...other devices
];

// Selection criteria object (Replace with actual user input)
let selectionCriteria = {
    'mac-address': '00:00:00:00:00:00',
    id: 'id1',
    serial: 'serial1',
    name: 'Device1'
};

// Device Filtering
let filteredDevices = devices.filter(device => {
    return (
        (selectionCriteria['mac-address'] ? device.mac_address === selectionCriteria['mac-address'] : true) &&
        (selectionCriteria.id ? device.id === selectionCriteria.id : true) &&
        (selectionCriteria.serial ? device.serial === selectionCriteria.serial : true) &&
        (selectionCriteria.name ? device.name === selectionCriteria.name : true)
    );
});

// Output filtered devices
console.log(filteredDevices);


```