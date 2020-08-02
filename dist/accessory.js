"use strict";
const dgram_1 = require("dgram");
/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything directly from the "homebridge" module (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap;
class UDPGarageDoor {
    constructor(log, config, api) {
        this.currentState = hap.Characteristic.CurrentDoorState.CLOSED;
        this.log = log;
        this.name = config.name;
        // this.switchService = new hap.Service.Switch(this.name);
        // this.switchService.getCharacteristic(hap.Characteristic.On)
        //   .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        //     log.info("Current state of the switch was returned: " + (this.switchOn? "ON": "OFF"));
        //     callback(undefined, this.switchOn);
        //   })
        //   .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        //     this.switchOn = value as boolean;
        //     log.info("Switch state was set to: " + (this.switchOn? "ON": "OFF"));
        //     callback();
        //   });
        this.garageDoorOpenerService = new hap.Service.GarageDoorOpener(this.name);
        this.garageDoorOpenerService.getCharacteristic(hap.Characteristic.CurrentDoorState)
            .on("get" /* GET */, (callback) => {
            this.log("GET CurrentDoorState");
            callback(null, hap.Characteristic.CurrentDoorState.CLOSED);
        });
        this.garageDoorOpenerService.getCharacteristic(hap.Characteristic.TargetDoorState)
            .on("get" /* GET */, (callback) => {
            this.log("GET TargetDoorState");
            callback(null, hap.Characteristic.TargetDoorState.CLOSED);
        })
            .on("set" /* SET */, (value, callback) => {
            this.log(`SET TargetDoorState = ${value}`);
            callback(null, value);
        });
        this.garageDoorOpenerService.getCharacteristic(hap.Characteristic.ObstructionDetected)
            .on("get" /* GET */, (callback) => {
            this.log("GET ObstructionDetected");
            callback(null, false);
        });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
            .setCharacteristic(hap.Characteristic.Model, "Custom Model");
        this.client = dgram_1.createSocket('udp4');
        this.client.on('listening', () => {
            const address = this.client.address();
            this.log('UDP Client listening on ' + JSON.stringify(address));
            this.client.setBroadcast(true);
            this.client.setMulticastTTL(128);
            this.client.addMembership('224.1.1.1', '0.0.0.0');
        });
        this.client.on('message', (message, remote) => {
            this.log('A: Epic Command Received. Preparing Relay.');
            this.log('B: From: ' + remote.address + ':' + remote.port + ' - ' + message);
        });
        this.client.bind(5077);
        log.info("Switch finished initializing!");
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        this.log("Identify!");
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        return [
            this.informationService,
            this.garageDoorOpenerService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerAccessory("udpgaragedoor", UDPGarageDoor);
};
//# sourceMappingURL=accessory.js.map