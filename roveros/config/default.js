
module.exports = {
    'iot': {
        'endpoint': require('./bootstrap.json').endpoint, //process.env.AWS_IOT_ENDPOINT || 'a1o1xryvmqvun7.iot.ap-southeast-2.amazonaws.com',
        'clientId': process.env.CLIENT_ID || 'roborover_abc123',
        'topic': {
            'telemetry': 'roborover/telemetry/#',
            'control': 'roborover/control/#'
        }
    },
    'deviceSerial': process.env.SERIAL_NO,
    'sensors': {
        'enabled': true,
        'pollingInterval': 30000, // 5 sec polling interval
    },
    'log': 'debug'
}