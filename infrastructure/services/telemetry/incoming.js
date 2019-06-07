'use strict';

let TelemetryModel = require('../../libs/models/telemetry.model');
let { v4 } = require('uuid');

module.exports.handler = async (event) => {

  let message = {};

  if (typeof event === 'object') {
      message = event;
  } else {
      message = JSON.parse(event);
  }

  message['telemetryId'] = v4();

  let telemetry = new TelemetryModel(message);

  telemetry.save((err) => {
    if(err) {
      console.log(err);
      return;
    }
  });

};
