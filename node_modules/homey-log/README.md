# homey-log

## Introduction
This module can be used in a Homey App to send events to [Sentry](http://sentry.io/).

> Note: homey-log@2.0.0 and higher is only compatible with Homey Apps SDK version 3. If you are still on version 2, please use homey-log@1.0.6 or lower.

## Installation

```bash
npm install --save homey-log
```

## Getting started

In `env.json`, add the Sentry URL:

```json
{
	"HOMEY_LOG_URL": "https://foo:bar@sentry.io/123456"
}
```

In `app.js`, include the library and create a new `Log` instance:

```js
const { Log } = require('homey-log');

class MyApp extends Homey.App {
    onInit() {
        this.homeyLog = new Log({ homey: this.homey });
    }
}
```

### Notes

* When your app crashes due to an `uncaughtException` or `unhandledRejection`, this will automatically be sent to Sentry.
* When running your app with `homey app run` events will not be sent to Sentry.

## Docs
See [https://athombv.github.io/node-homey-log](https://athombv.github.io/node-homey-log)

## Changelog
### 2.0.0

This version is only SDK version 3 compatible. It now requires a different way of setting up the `Log` instance, see _Getting Started_.
