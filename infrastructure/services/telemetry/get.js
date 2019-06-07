'use strict';
let { failure, success } = require('../../libs/helper');
let TelemetryModel = require('../../libs/models/telemetry.model');

module.exports.handler = async (event, context, callback) => {

  try {
    let result = await TelemetryModel.query('timestamp').descending().limit(10).exec();
    return callback(null, success(result));

  } catch (e) {
    return callback(null, failure(e));
  }

};
