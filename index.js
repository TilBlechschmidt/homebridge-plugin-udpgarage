'use strict';

var Service, Characteristic, DoorState, PlatformAccessory;

function UDPGarageDoor(log, config) {
	this.log = log;
	this.name = config["name"];
	this.ip = config["ip"];

	this.garageDoorOpener = new Service.GarageDoorOpener(this.name);

	this.currentDoorState = this.garageDoorOpener.getCharacteristic(Characteristic.CurrentDoorState);
    	this.currentDoorState
		.on('get', this.getState.bind(this));

	// true = closed, open = false
	this.currentTargetState = true
	this.targetDoorState = this.garageDoorOpener.getCharacteristic(Characteristic.TargetDoorState);
    	this.targetDoorState
		.on('set', this.setTargetState.bind(this))
    		.on('get', this.getTargetState.bind(this));

	this.ObstructionDetected = this.garageDoorOpener.getCharacteristic(Characteristic.ObstructionDetected);
	this.ObstructionDetected.on('get', function () { return false; });

    	this.infoService = new Service.AccessoryInformation();
    	this.infoService
      	   .setCharacteristic(Characteristic.Manufacturer, "Opensource Community")
           .setCharacteristic(Characteristic.Model, "Homebridge UDP GarageDoor")
	   .setCharacteristic(Characteristic.FirmwareRevision,"1.0.0");

}

UDPGarageDoor.prototype = {
	getState: function(callback) {
		callback(null, DoorState.CLOSED);
	},

	getTargetState: function(callback) {
		callback(this.currentTargetState);
	},

	setTargetState: function(status, callback) {
		console.log("new target state:", status);	
		this.currentTargetState = status;

		if (status == DoorState.OPEN) {
			console.log("opening");
		} else {
			console.log("closing");
		}
	}

	getServices:  function() {
		return [this.infoService, this.garageDoorOpener];
	},
};

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;
	DoorState = homebridge.hap.Characteristic.CurrentDoorState;

  	homebridge.registerAccessory("homebridge-plugin-udpgarage", "udpgaragedoor", UDPGarageDoor);
}
