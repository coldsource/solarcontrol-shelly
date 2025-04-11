function bleEvent(evtype, ev)
{
	if (evtype !== BLE.Scanner.SCAN_RESULT)
		return;

	if(ev.service_data===undefined)
		return; // Control frame

	let ret = {};
	for(let key in ev.service_data)
	{
		const data = ev.service_data[key];

		ret[key] = '';
		for(let i=0; i<data.length; i++)
		{
			let hex_byte = data.at(i).toString(16);
			ret[key] += (hex_byte.length==1?'0':'') + hex_byte;
		}
	}

	if(MQTT.isConnected())
		MQTT.publish('sc-ble-gateway/' + ev.addr.split(':').join(''), JSON.stringify(ret));
}

function init()
{
	// Get the config of ble component
	const BLEConfig = Shelly.getComponentConfig("ble");

	// Exit if the BLE isn't enabled
	if (!BLEConfig.enable)
		return console.log("Error: The Bluetooth is not enabled, please enable it from settings");

	// Check if the scanner is already running
	if(BLE.Scanner.isRunning())
		return console.log("Info: The BLE gateway is running, the BLE scan configuration is managed by the device");

	// Start the scanner
	const bleScanner = BLE.Scanner.Start({ duration_ms: BLE.Scanner.INFINITE_SCAN, active: false });
	if (!bleScanner)
		console.log("Error: Can not start new scanner");

	// subscribe a callback to BLE scanner
	BLE.Scanner.Subscribe(bleEvent);
}

init();
