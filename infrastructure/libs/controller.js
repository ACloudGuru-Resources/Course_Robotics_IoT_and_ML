'use strict';

const { Iot, IotData } = require('aws-sdk');

let iot = new Iot({});

class Controller {

  static sendData(data) {

    if(data === undefined) return;

    return new Promise((resolve, reject) => {
        iot.describeEndpoint({}, (err, data) => {
            if(err) return reject(new Error(err));
            
            // publish to topics/roborover/control
            let topic = ['roborover','control'].join('/');

            let iotData = new IotData({ endpoint: data.endpointAddress });

            let params = {
                topic: topic,
                payload: JSON.stringify({
                    timestamp: moment().tz(mission.timezone).format('YYYY-MM-DD HH:mm:ss.SSSSSSSSS'),
                    priority: 'low',
                    type: 'start',
                    start: mission
                }),
                qos: 0
            };
            
            iotData.publish(params, (err) => {
                if(err) return reject(new Error(err));
                return resolve(true);
            });

        });

    });
  }
}

module.exports = Controller;