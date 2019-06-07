'use strict';

const AWS = require('aws-sdk');
const ImageModel = require('./models/image.model');

const recognition = new AWS.Rekognition();

class Recognizer {

  static resolveLabels({bucket, imageName}) {
    
    const params = {
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: imageName,
        },
      },
      MaxLabels: 10,
      MinConfidence: 50,
    };

    console.log(`Analyzing file: https://s3.amazonaws.com/${bucket}/${imageName}`);

    return new Promise((resolve, reject) => {
      recognition.detectLabels(params, (err, data) => {
        if (err) {
          return reject(new Error(err));
        }
        console.log('Analysis labels:', data.Labels);
        return resolve(data.Labels);
      });
    });
  }

  static saveLabels({bucket, imageName, labels}) {
    
    const image = new ImageModel({
      roboRoverId: 'robo_rover',
      labels: labels,
      imagePath: `https://s3.amazonaws.com/${bucket}/${imageName}`
    });

    return new Promise((resolve, reject) => {
      image.save((err)=> {
        if(err) {
          return reject(new Error(err));
        }
        return resolve(image);
      });
    });    

  }
}

module.exports = Recognizer;