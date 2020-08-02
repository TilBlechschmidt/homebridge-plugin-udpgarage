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
	this.ObstructionDetected.on('get', function(callback) { 
		console.log("get obstruction detected")
		callback();
	});

    	this.infoService = new Service.AccessoryInformation();
    	this.infoService
      	   .setCharacteristic(Characteristic.Manufacturer, "Opensource Community")
           .setCharacteristic(Characteristic.Model, "Homebridge UDP GarageDoor")
	   .setCharacteristic(Characteristic.FirmwareRevision,"1.0.0");

    	this.currentDoorState.updateValue( DoorState.CLOSED );
   	this.targetDoorState.updateValue( DoorState.CLOSED );
        this.currentDoorState.getValue();
}

UDPGarageDoor.prototype = {
	getState: function(callback) {
		console.log("garage door getState");
		this.log("garage door getState");
		callback(null, DoorState.CLOSED);
	},

	getTargetState: function(callback) {
		console.log("garage door getTargetState");
		this.log("garage door getTargetState");
		callback(this.currentTargetState);
	},

	setTargetState: function(status, callback) {
		console.log("new target state:", status);	
		this.log("garage door new target:", status);
		this.currentTargetState = status;

		if (status == DoorState.OPEN) {
			console.log("opening");
		} else {
			console.log("closing");
		}
	},

	getServices: function() {
		console.log("garage door get services");
		this.log("garage door get services");
		return [this.infoService, this.garageDoorOpener];
	},
};

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;
	DoorState = homebridge.hap.Characteristic.CurrentDoorState;

  	homebridge.registerAccessory("homebridge-plugin-udpgarage", "udpgaragedoor", UDPGarageDoor);
}
