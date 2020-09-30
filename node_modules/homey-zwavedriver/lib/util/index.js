'use strict';

const color = require('./color');

/**
 * Allows accessing an object by a nested string path.
 * @param object
 * @param path
 * @returns {*}
 * @private
 *
 * @example
 * const foo = {bar: { foobar: '123'} };
 * resolveKeyPath(foo, 'bar.foobar'); // returns '123'
 */
function resolveKeyPath(object = {}, path = '') {
  return path.split('.').reduce((o, p) => (o ? o[p] : null), object);
}

/**
 * Map a range of values to a different range of values.
 * @param inputStart
 * @param inputEnd
 * @param outputStart
 * @param outputEnd
 * @param input
 * @returns {number | null}
 * @memberof Util
 */
function mapValueRange(inputStart, inputEnd, outputStart, outputEnd, input) {
  if (
    typeof inputStart !== 'number'
    || typeof inputEnd !== 'number'
    || typeof outputStart !== 'number'
    || typeof outputEnd !== 'number'
    || typeof input !== 'number'
  ) {
    return null;
  }
  return (
    outputStart
    + ((outputEnd - outputStart) / (inputEnd - inputStart))
      * (Math.min(Math.max(inputStart, input), inputEnd) - inputStart)
  );
}

/**
 * Calculate a duration value for SWITCH_MULTILEVEL and SWITCH_BINARY from an input value in
 * milliseconds. Below 127 the value is in seconds, above the value is in minutes. Hence, above
 * 127 some rounding might occur. If a value larger than 7560 is entered it will be maxed at 254
 * (longest duration possible).
 * @param {number} duration - Dim duration in milliseconds (0 - 7560000ms)
 * @param {object} opts
 * @param {number} opts.maxValue - Use a custom max value
 * @returns {number} Range 0 - 254 (short to long)
 * 1-127 = 1 second – 127 seconds
 * 128 – 253 = 1 minute – 126 minutes
 * 254 max
 */
function calculateDimDuration(duration, opts = {}) {
  if (typeof duration !== 'number') {
    // If no `duration` value is available use the factory default
    return 0xff;
  }
  const seconds = duration / 1000;
  const maxValue = Object.prototype.hasOwnProperty.call(opts, 'maxValue') ? opts.maxValue : 254;
  if (seconds <= 127) return Math.min(Math.max(0, seconds), maxValue);
  if (seconds > 127 && seconds < 7560) {
    return Math.min(Math.round(128 + seconds / 60), maxValue);
  }

  return maxValue;
}

/**
 * @deprecated since v1.0.0 - Use {@link calculateDimDuration} instead.
 * @param {number} duration - Dim duration in milliseconds (0 - 7560000ms)
 * @param {object} opts
 * @param {number} opts.maxValue - Use a custom max value
 * @returns {number} Range 0 - 254 (short to long)
 * 1-127 = 1 second – 127 seconds
 * 128 – 253 = 1 minute – 126 minutes
 * 254 max
 */
function calculateZwaveDimDuration(duration, opts = {}) {
  return calculateDimDuration(duration, opts);
}

let localeFile;

/**
 * Method that loads a specific locale file based on provided `language`.
 * @param {string} [language=Homey.ManagerI18n.getLanguage()]
 * @private
 */
function loadLocales(language) {
  if (typeof language !== 'string') throw new Error('Expected language string');
  try {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    localeFile = require(`../../locales/${language}.json`);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      // eslint-disable-next-line no-console
      console.error(`Accessing non-existent locales file ../../locales/${language}.json`);
    } else {
      throw err;
    }
  }
}

/**
 * Method that returns a translated string for a given language code and locale key.
 * @param {string} language - e.g. 'en' or 'nl'
 * @param {string} localeKey - e.g. 'errors.unknown'
 * @returns {string}
 * @private
 */
function __(language, localeKey) {
  if (typeof localeKey !== 'string') throw TypeError('expected_locale_key_string');

  // Load locale file if not yet loaded
  if (!localeFile) loadLocales(language);

  // Fallback to english
  if (!localeFile) loadLocales('en');

  // Return translated string if found
  const localeValue = resolveKeyPath(localeFile, localeKey);
  if (localeFile && typeof localeValue === 'string') return localeValue;

  // Else return the given locale key
  return localeKey;
}

/**
 * Utility class with several color and range conversion methods.
 * @class Util
 */
module.exports = {
  convertRGBToCIE: color.convertRGBToCIE,
  convertHSVToCIE: color.convertHSVToCIE,
  convertHSVToRGB: color.convertHSVToRGB,
  convertRGBToHSV: color.convertRGBToHSV,
  mapValueRange,
  calculateZwaveDimDuration,
  calculateDimDuration,
  __,
};
