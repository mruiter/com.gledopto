# homey-zwavedriver

## Introduction
This module can be used to make the development of Z-Wave apps for Homey easier.

It is essentially a map-tool from Homey-capabilities to Z-Wave Command Classes.

Note: this module can only be used in Homey Apps built on SDKv3 which is available as of Homey v5.0.0.

## Installation

```bash
$ npm install --save homey-zwavedriver
```

## Getting started

Start by looking at the docs for [`ZwaveDevice`](https://athombv.github.io/node-homey-zwavedriver/ZwaveDevice.html). This is the class you most likely want to extend from. If you are implementing a `light` device take a look at
 [`ZwaveLightDevice`](https://athombv.github.io/node-homey-zwavedriver/ZwaveLightDevice.html).

See [examples/fibaroplug.js](https://github.com/athombv/node-homey-zwavedriver/blob/master/examples/fibaroplug.js) and [examples/fibaroplug.json](https://github.com/athombv/node-homey-zwavedriver/blob/master/examples/fibaroplug.json)

## Docs
See [https://athombv.github.io/node-homey-zwavedriver](https://athombv.github.io/node-homey-zwavedriver)

## Deprecations and breaking changes for homey-zwavedriver

This is a non exhaustive list of deprecations and breaking changes in `homey-zwavedriver` with respect to `homey-meshdriver` which might be good to be aware of:

- `MeshDevice` is removed in favour of `ZwaveDevice`.
- `onMeshInit()` is deprecated in favour of `onNodeInit()`.
- `calculateZwaveDimDuration` is deprecated in favour of `calculateDimDuration`.
- `ZwaveMeteringDevice` and `ZwaveLockDevice` are removed.
