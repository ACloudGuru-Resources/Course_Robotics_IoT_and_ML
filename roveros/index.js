const _ = require('lodash');
const awsIot = require('aws-iot-device-sdk');
const winston = require('winston');
const program = require('commander');

const Rover = require('./libs/rover');

let rover = new Rover();

let config;
let device;
let interval;

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {

    rover.kill();
    clearInterval(interval);
    
    process.exit(0);
});

program
  .version('1.0.0')
  .option('-d, --development', 'Development environment')
  .option('-e, --endpoint [endpoint]', 'AWS IoT Endpoint where the Pi\'s will connect to')
  .option('-c, --clientId [clientId]', 'Unique Client ID')
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


winston.level = config.log;

if(config['mac']) {

}

winston.debug(config);


config['baseEvent'] = {
    longitude: 33.3,
    latitude: 44.4,
    humidity: 84,
    pressure: 1003,
    temperature: 18,
    last_command: undefined
}

let telemetryInterval = () => {
    if(!device || !rover) return;

    let telemetryData = rover.getAllTelemetry();
    let event = _.assign(cfg.baseEvent, telemetryData);

    device.publish(config.iot.topic.telemetry,
        JSON.stringify(event), (err, data) => {
            if(!err) winston.log('debug', '[EVENT]: ' + data);
        });
}

function bootstrap(cfg) {

    device = awsIot.device({
        keyPath: `certs/deviceCert.key`,
        certPath: `certs/deviceCertAndCACert.crt`,
        caPath: 'certs/root.crt',
        clientId: cfg.iot.clientId,
        host: cfg.iot.endpoint,
        debug: cfg.log == 'debug' ? true : false
    });
    
    device.subscribe(cfg.iot.topic.control);

    device.on('connect', () => {
        winston.info(`Connected to ${cfg.iot.endpoint}`);
        interval = setInterval(telemetryInterval, cfg.sensors.pollingInterval);
    });
    
    device
        .on('message', function (topic, payload) {

            let data = JSON.parse(payload.toString());

            winston.log('debug', '[MESSAGE]:', topic, data);

            config['baseEvent'].last_command = data;

            switch(topic) {
                case cfg.iot.queue.control:
                    let command = {}
                    try {
                        
                        command['type'] = data.type;
                        command[data.type] = data[data.type];
                        rover.execute(command);

                    }catch(e) {

                    }

                    break;
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

    return device;

}

bootstrap(config);