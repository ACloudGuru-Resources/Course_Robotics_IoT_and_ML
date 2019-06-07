
module.exports = {
    'iot': {
        'endpoint': process.env.AWS_IOT_ENDPOINT || 'a1o1xryvmqvun7.iot.ap-southeast-2.amazonaws.com',
        'clientId': process.env.CLIENT_ID,
        'queue': {
            //'telemetry': 'device/telemetry/event',
            'telemetry': 'device/telemetry/' + process.env.SERIAL_NO,
            'control': 'device/control/' + process.env.SERIAL_NO,
            'alert': 'device/alert/' + process.env.SERIAL_NO,
            'control': 'device/control/' + process.env.SERIAL_NO + '/takeoff',
        }
    },
    'device': {
        'serialNo': process.env.SERIAL_NO,
        'hostname': process.env.HOSTNAME
    },
    'sensors': {
        'enabled': true,
        'pollingInterval': 30000, // 5 sec polling interval
    },
    'log': 'debug'
}