'use strict';

const HomeyModule = require('homey');

const Raven = require('raven');

class Log {

  /**
   * Construct a new Log instance.
   * @param {object} homey - `this.homey` instance in
   * your app (e.g. `App#homey`/`Driver#homey`/`Device#homey`).
   *
   * @example
   * class MyApp extends Homey.App {
   *   onInit() {
   *     this.homeyLog = new Log({ homey: this.homey });
   *   }
   * }
   */
  constructor({ homey }) {
    this._capturedMessages = [];
    this._capturedExceptions = [];

    if (typeof homey === 'undefined') {
      return Log._error('Error: missing `homey` constructor parameter');
    }

    if (!HomeyModule.env) {
      return Log._error('Error: could not access `HomeyModule.env`');
    }

    if (typeof HomeyModule.env.HOMEY_LOG_URL !== 'string') {
      return Log._error('Error: expected `HOMEY_LOG_URL` env variable, homey-log is disabled');
    }

    // Check if debug mode is enabled
    const disableRaven = process.env.DEBUG === '1' && HomeyModule.env.HOMEY_LOG_FORCE !== '1';
    if (disableRaven) {
      Log._log('App is running in debug mode, disabling Raven');
    }

    this._manifest = HomeyModule.manifest;
    this._homeyVersion = homey.version;
    this._managerCloud = homey.cloud;

    // Init Raven, pass falsy value if raven is not enabled to prevent sending events upstream
    // in debug mode
    this.init(!disableRaven && HomeyModule.env.HOMEY_LOG_URL, {
      captureUnhandledRejections: true, // Start tracking unhandled promise rejections (not enabled
      // by default)
    });
  }

  /**
   * Init Raven, provide falsy value as `url` to prevent sending events upstream in debug mode.
   * @param {string|boolean} url
   * @param {object} opts
   * @param {boolean} opts.captureUnhandledRejections - Track unhandled promise rejections not
   * enabled by default)
   * @returns {Log}
   * @private
   */
  init(url, opts) {
    Raven.config(url, opts).install();

    this.setTags({
      appId: this._manifest.id,
      appVersion: this._manifest.version,
      homeyVersion: this._homeyVersion,
    });

    // Get homey cloud id and set as tag
    this._managerCloud.getHomeyId()
      .then(homeyId => this.setTags({ homeyId }))
      .catch(err => Log._error('Error: could not get `homeyId`', err));

    Log._log(`App ${this._manifest.id} v${this._manifest.version} logging on Homey v${this._homeyVersion}...`);
    return this;
  }

  /**
   * Set `tags` that will be send as context with every message or error. See the raven-node
   * documentation: https://docs.sentry.io/clients/node/usage/#raven-node-additional-context.
   * @param {object} tags
   * @returns {Log}
   */
  setTags(tags) {
    Log._mergeContext('tags', tags);
    return this;
  }

  /**
   * Set `extra` that will be send as context with every message or error. See the raven-node
   * documentation: https://docs.sentry.io/clients/node/usage/#raven-node-additional-context.
   * @param {object} extra
   * @returns {Log}
   */
  setExtra(extra) {
    Log._mergeContext('extra', extra);
    return this;
  }

  /**
   * Set `user` that will be send as context with every message or error. See the raven-node
   * documentation: https://docs.sentry.io/clients/node/usage/#raven-node-additional-context.
   * @param {object} user
   * @returns {Log}
   */
  setUser(user) {
    Log._mergeContext('user', user);
    return this;
  }

  /**
   * Create and send message event to Sentry. See the raven-node documentation:
   * https://docs.sentry.io/clients/node/usage/#capturing-messages
   * @param {string} message - Message to be sent
   * @returns {Promise<string>|undefined}
   */
  async captureMessage(message) {
    Log._log('captureMessage:', message);

    if (this._capturedMessages.indexOf(message) > -1) {
      Log._log('Prevented sending a duplicate message');
      return;
    }

    this._capturedMessages.push(message);

    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      Raven.captureMessage(
        message,
        (err, result) => {
          if (err) return reject(err);
          return resolve(result);
        },
      );
    });
  }

  /**
   * Create and send exception event to Sentry. See the raven-node documentation:
   * https://docs.sentry.io/clients/node/usage/#capturing-errors
   * @param {Error} err - Error instance to be sent
   * @returns {Promise<string>|undefined}
   */
  async captureException(err) {
    Log._log('captureException:', err);

    if (this._capturedExceptions.indexOf(err) > -1) {
      Log._log('Prevented sending a duplicate log');
      return;
    }

    this._capturedExceptions.push(err);

    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      Raven.captureException(
        err,
        (captureErr, result) => {
          if (captureErr) return reject(captureErr);
          return resolve(result);
        },
      );
    });
  }

  /**
   * Mimic SDK log method.
   * @private
   */
  static _log() {
    // eslint-disable-next-line prefer-spread,prefer-rest-params,no-console
    console.log.bind(null, Log._logTime(), '[homey-log]').apply(null, arguments);
  }

  /**
   * Mimic SDK error method.
   * @private
   */
  static _error() {
    // eslint-disable-next-line prefer-spread,prefer-rest-params,no-console
    console.error.bind(null, Log._logTime(), '[homey-log]').apply(null, arguments);
  }

  /**
   * Mimic SDK timestamp.
   * @returns {string}
   * @private
   */
  static _logTime() {
    const date = new Date();

    let mm = date.getMonth() + 1;
    mm = (mm < 10 ? `0${mm}` : mm);
    let dd = date.getDate();
    dd = (dd < 10 ? `0${dd}` : dd);
    let hh = date.getHours();
    hh = (hh < 10 ? `0${hh}` : hh);
    let min = date.getMinutes();
    min = (min < 10 ? `0${min}` : min);
    let sec = date.getSeconds();
    sec = (sec < 10 ? `0${sec}` : sec);

    return `${date.getFullYear()}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }

  /**
   * Raven.mergeContext covers only 1-level of the context (tags, extra, user)
   * We need to merge a 2-level of the context
   * see https://github.com/getsentry/raven-node/issues/228
   * @param {string} key
   * @param {object} value
   * @private
   */
  static _mergeContext(key, value) {
    const context = Raven.getContext();
    if (!context[key]) {
      context[key] = {};
    }

    Object.assign(context[key], value);
    Raven.setContext(context);
  }

}

module.exports = Log;
