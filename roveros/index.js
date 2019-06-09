const _ = require('lodash');
const awsIot = require('aws-iot-device-sdk');
const moment = require('moment');
const winston = require('winston');
const program = require('commander');

//const getSerial = require('./lib/common').getSerial;

let config;

program
  .version('1.0.0')
  .option('-d, --development', 'Development environment')
  .option('-e, --endpoint [endpoint]', 'AWS IoT Endpoint where the Pi\'s will connect to')
  .option('-c, --clientId [clientId]', 'Unique Client ID')
  .option("-m, --mac", "If on MacBook")
  .parse(process.argv);


if(!program.development)
    config = require('./config')('production');
else
    config = require('./config')('development');

config['mac'] = false;

if (program.endpoint) 
    config.iot.endpoint = program.endpoint;

if (program.clientId)
    config.iot.clientId = program.clientId;

if(program.mac)
    config['mac'] = true

winston.level = config.log;

if(config['mac']) {

}

winston.debug(config);


config['baseEvent'] = {
    deviceId: config.device.serialNo,
    missionId: 'AAAA-BBBB-CCCC'
}

function bootstrap(cfg) {

    var device = awsIot.device({
        keyPath: `certs/deviceCert.key`,
        certPath: `certs/deviceCertAndCACert.crt`,
        caPath: 'certs/root.crt',
        clientId: cfg.iot.clientId,
        host: cfg.iot.endpoint,
        debug: cfg.log == 'debug' ? true : false
    });
    
    device.subscribe(cfg.iot.queue.control);

    device.on('connect', () => {
    
        winston.info(`Connected to ${cfg.iot.endpoint}`);
    
        let event;
    
        setInterval(() => {
    
            const data = {
                lon: 33.3,
                lat: 55.5,
                elevation: 156.5,
                timestamp: moment().format()
            }
    
            event = _.assign(cfg.baseEvent, data);
            // device/telemetry/<serialNumber>
            device.publish(cfg.iot.queue.telemetry, JSON.stringify(event), (err, data) => {
                if(!err) winston.log('debug', '[EVENT]: ' + JSON.stringify(event));
            });
    
        }, cfg.sensors.pollingInterval);

    
    
    });
    
    device
        .on('message', function (topic, payload) {
            //winston.log('debug', '[MESSAGE]:', topic, payload.toString());

            let e = JSON.parse(payload.toString());
            
            console.log(e);

            if(topic == cfg.iot.queue.control) {
                // TODO: control stuff

                let event = {
                    type: 'status',
                    origin: 'device',
                    destination: 'base',
                    data: {
                        status: 'liftoff'
                    },
                    mission: e.mission,
                    timestamp: moment.utc().format('YYYY-MM-DD HH:mm:ss.SSSSSSSSS')                        
                };

                setTimeout(() => {
                    
                    device.publish(cfg.iot.queue.control + 'takeoff_response', JSON.stringify(event), (err, data) => {
                        if(!err) winston.log('debug', '[CONTROL]: initiating liftoff');
                        else if(!err) console.log(err);
                    });
                    
                }, 5000)
            }
        });
    
    device
        .on('close', function () {
            winston.log('debug', `[CLOSE]: ${cfg.iot.endpoint}`);
        });
    device
        .on('reconnect', function () {
            winston.log('debug', `[RECONNECT]: ${cfg.iot.endpoint}`);
        });
    device
        .on('offline', function () {
            winston.log('debug', `[OFFLINE]: ${cfg.iot.endpoint}`);
        });
    device
        .on('error', function (error) {
            winston.log('error', error);
        });

    console.log('cool');

    return device;

}

bootstrap(config);



// possible ways to have the payload:

