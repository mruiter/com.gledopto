"use strict";

const Homey = require("homey");

// Enable zigbee-cluster logging
 const { Util } = require('homey-zigbeedriver');
 Util.debugZigbeeClusters(true);

class GledoptoZigbeeApp extends Homey.App {
  onInit() {
    this.log("Gledopto Zigbee app initiating...");
  }
}

module.exports = GledoptoZigbeeApp;
