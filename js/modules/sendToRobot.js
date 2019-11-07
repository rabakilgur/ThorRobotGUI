/*
* Author: Robin Garbe
* License: MIT
* Version: 1.2.1
*/

module.exports = {
    init: (comPort, baudRate) => {
        return init(comPort, baudRate);
    },
    send: (text) => {
        send(text);
    },
    close: () => {
        close();
	},
	get_status: () => {
		return status;
	}
};

const sprint = process.sprint;
const show_error = process.show_error;
var shared = global.sharedObj;

// Stuff we need for the serial transmission:
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
let connection;

/* Status Codes:
* -2 - Error while connecting
* -1 - General Error
*  0 - Uninitialized / Closed
*  1 - Connecting
*  2 - Connected
*/
let status = 0;

let first_respone = ""; // The first reponse received from a connected device. This is being used to identify Thor

/// @param: Link to the plc in the settings file. (Example: "shared.settings.opc.server.devices[0]")
function init(comPort, baudRate) {
	console.log(`Initializing SerialPort... (Port: ${comPort} | Rate: ${baudRate})`);
	if (settings.verboseOutput) cnsl(`Initializing SerialPort... (Port: ${comPort} | Rate: ${baudRate})`, "System");
	status = 1;
    connection = new SerialPort(comPort, { baudRate: baudRate, autoOpen: false });

    connection.open((err) => {
        if (err) {
			console.error("❌ Connection failed with error:", err);
			cnsl(`❌ Connection failed with error: ${err.message}`, "Error");
			status = -2;
        } else {
			console.log("✔ Connection successfully established");
			cnsl(`✔ Connection succesfully established`, "Success");
			console.log("Initializing Parser...");
			if (settings.verboseOutput) cnsl(`Initializing Parser...`, "System");
            const parser = new Readline();
            connection.pipe(parser);
			console.log("✔ Piped Parser to connection");
			if (settings.verboseOutput) cnsl(`✔ Piped Parser to connection`, "Success");
			first_respone = "";
            parser.on('data', line => {
                console.log(`> ${line}`);
                $(".console-output").append(`
					<div data-source="Output">${line}</div>
				`);
				if (first_respone.trim() === "") first_respone = line;
			});
			status = 2;
        }
    });
    
    connection.on("error", (err) => {
		if ( status !== 0 ) {
			console.error('Error with SerialPort: \n', err.message);
			cnsl(`Error with SerialPort: ${err.message}`, "Error");
			status = -1;
		}
		
	});
	
	return new Promise((resolve, reject) => {
		check_if_Thor()
			.then( response => { resolve(response); })
			.catch(err      => { reject(err);       });
	});
}

function send(text) {
    if (connection === undefined) throw {message: "Not connected"};
    connection.write(text + '\n');
}

function close() {
	console.log("Closing the connection...");
	cnsl("Closing the connection...", "System");
	connection.close();
	console.log("✔ Connection closed");
	cnsl("✔ Connection closed", "Warning");
	status = 0;
}

function check_if_Thor() {
	return new Promise((resolve, reject) => {
		let connectionCheck = setInterval(() => {
			if (status === 2) {  // Wait till a connection has been established
				clearInterval(connectionCheck);
				clearTimeout(connectionTimeout);
				console.log(`Checking if connected device is Thor...`);
				cnsl(`Checking if connected device is Thor...`, "System");	
				let thorCheck = setInterval(() => {
					if ( first_respone.startsWith("Grbl") ) {
						resolve("Thor connected");
						status = 3;
						clearInterval(thorCheck);
						clearTimeout(thorTimeout);
					}
				}, 100);
				let thorTimeout = setTimeout(() => {  // Timeout after 5s
					clearInterval(thorCheck);
					// reject({message: "Connection timed out after 5s"});
					reject({message: "Connected device is <b>not</b> Thor"});
					close();
					status = 0;
				}, 5050);
			}
		}, 50);
		let connectionTimeout = setTimeout(() => {
			clearInterval(connectionCheck);
			throw {message: "Connection took too long"};
		}, 5025);
	});
}