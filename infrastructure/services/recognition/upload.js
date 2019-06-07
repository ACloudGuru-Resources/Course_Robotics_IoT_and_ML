'use strict';

let _ = require('lodash');
let Recognizer = require('../../libs/recognizer');

module.exports.handler = async (event) => {

  try {
    let s3Data = event.Records[0].s3;

    console.log(s3Data);

    let labels = await Recognizer.resolveLabels({ bucket: s3Data.bucket.name, imageName: s3Data.object.key });
    await Recognizer.saveLabels({ bucket: s3Data.bucket.name, imageName: s3Data.object.key, labels: labels});

  } catch(e) {
    console.log(e);
  }

};
