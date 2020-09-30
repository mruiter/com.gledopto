'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class MyZWaveDevice extends ZwaveDevice {

  onMeshInit() {
    this.log('MyZWaveDevice has been inited');
  }

}

module.exports = MyZWaveDevice;
