'use strict';

const defines = require('./defines.json');

module.exports = payload => {
  // replace Meter Type
  try {
    if (payload.Properties1 && typeof payload.Properties1['Meter Type'] !== 'undefined') {
      payload.Properties1['Meter Type (Parsed)'] = {
        value: payload.Properties1['Meter Type'],
        name: defines['Meter Type'][payload.Properties1['Meter Type']],
      };
    }
  } catch (e) {
    // console.error('error replacing meter type', e);
  }

  // replace Rate Type
  try {
    if (payload.Properties1 && typeof payload.Properties1['Rate Type'] !== 'undefined') {
      payload.Properties1['Rate Type (Parsed)'] = {
        value: payload.Properties1['Rate Type'],
        name: defines['Rate Type'][payload.Properties1['Rate Type']],
      };
    }
  } catch (e) {
    // console.error('error replacing rate type', e);
  }

  // replace Scale
  try {
    if (payload.Properties2 && typeof payload.Properties2.Scale !== 'undefined') {
      payload.Properties2['Scale (Parsed)'] = {
        value: payload.Properties2.Scale,
        name:
          defines['Meter Scale'][
            defines['Meter Type Scale Map'][payload.Properties1['Meter Type'].name]
          ][payload.Properties2.Scale],
      };
    }
  } catch (e) {
    // console.error('error replacing scale', e);
  }

  try {
    if (typeof payload['Meter Value'] !== 'undefined') {
      payload['Meter Value (Parsed)'] = payload['Meter Value'].readIntBE(
        0,
        payload.Properties2.Size,
      );
      payload['Meter Value (Parsed)'] /= (10 ** payload.Properties2.Precision);
    }
  } catch (e) {
    // console.error('error parsing meter value', e);
  }

  // parse value
  try {
    if (typeof payload['Previous Meter Value'] !== 'undefined') {
      payload['Previous Meter Value (Parsed)'] = payload['Previous Meter Value'].readIntBE(
        0,
        payload.Properties2.Size,
      );
      payload['Previous Meter Value (Parsed)'] /= (10 ** payload.Properties2.Precision);
    }
  } catch (e) {
    // console.error('error parsing previous meter value', e);
  }

  return payload;
};
