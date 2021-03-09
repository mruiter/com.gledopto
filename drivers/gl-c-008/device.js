"use strict";

const Light = require("../Light.js");
const {
  debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

class glc008 extends Light {
    async onNodeInit({ zclNode }) {
        if (this.getStoreValue('colorTempMin') && this.getStoreValue('colorTempMax')) {
        }
        else {
            // only set the value if it's not provided by the device itself
            // this value is not used when registering the device,
            // causing an error in reportParser in light_temperature/colorControl.js.
            // this is solved by restarting the app though. still have to find a solution for this
            this.setStoreValue('colorTempMin', 155); // values returned from newer GL-C-008
            this.setStoreValue('colorTempMax', 495);
        }
        await super.onNodeInit({ zclNode });
    }
}

module.exports = glc008;
