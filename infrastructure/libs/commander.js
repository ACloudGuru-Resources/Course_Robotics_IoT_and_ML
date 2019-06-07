let { Iot, IotData } = 'aws-sdk';
let _ = require('lodash');

// Priority
const Priority = Object.freeze({
    LOW: Symbol('low'),
    MEDIUM: Symbol('medium'),
    HIGH: Symbol('high')
});

const CommandType = Object.freeze({
    MOVE: Symbol('move'),
    STOP: Symbol('stop'),
    WAYPOINTS: Symbol('waypoints'),
    SPEED: Symbol('speed'),
    IMAGE: Symbol('image')
});

const VERSION = '1.0';
const QOS = 0;

class Commander {
    constructor({ region = 'ap-southeast-2', topicPrefix = 'device/control', endpoint }) {

        this.region = region;
        this.endpoint = endpoint;
        this.topicPrefix = topicPrefix;


        this.iot = new Iot({ region: region });
        this.iotData = new IotData({ endpoint: endpoint });

    }

    _buildCommandTopic(uniqueDeviceId, command) {
        return [this.topicPrefix, command].join('/');
    }

    _buildBase({ missionId, priority = Priority.LOW, topic, type, data }) {

        let iotPayload = {}
        iotPayload['topic'] = topic;
        iotPayload['qos'] = QOS;

        iotPayload['payload'] = {};
        iotPayload['payload']['missionId'] = missionId;
        iotPayload['payload']['commandId'] = v4();
        iotPayload['payload']['version'] = VERSION;
        iotPayload['payload']['timestamp'] = Date.now();
        iotPayload['payload']['priority'] = priority;
        iotPayload['payload']['type'] = type;
        iotPayload['payload'][type] = data;

        return iotPayload;
    }

    _buildCommandData(device, commandType) {

        const { missionId, deviceId, ...payload } = device;
        const commandTopic = this._buildCommandTopic(deviceId, commandType);
        const data = this._buildBase({
            missionId: missionId,
            priority: priority,
            topic: commandTopic,
            type: commandType,
            data: payload
        });

        return data;
    }

    _publish(data) {
        return new Promise((resolve, reject) => {
            this.iotData.publish(data, (err) => {
                if (err) return reject(err);
                return resolve(true);
            });
        })
    }

    // [{ uniqueDeviceId: 1111, missionId: 2222 }]
    land({ devices = [], priority = Priority.HIGH, ack = false }) {

        // return an array of promises per unique device (if we want to "broadcast" a message to multiple devices)
        let _publishPromises = _.map(devices, (device) => {
            let _commandData = this._buildCommandData(device, CommandType.LAND);
            return this._publish(_commandData);
        })

        return Promise.all(_publishPromises);
    }

    returnToLanding({ devices = [], priority = Priority.HIGH, ack = false }) {

        // return an array of promises per unique device (if we want to "broadcast" a message to multiple devices)
        let _publishPromises = _.map(devices, (device) => {
            let _commandData = this._buildCommandData(device, CommandType.RETURN_TO_LANDING);
            return this._publish(_commandData);
        });

        return Promise.all(_publishPromises);

    }
    //[{ deviceId: 'aaa', missionId: 'aaaa', waypoints: [] }, { deviceId: 'bbb', missionId: 'bbsb', waypoint: []  }]
    fly({ devices = [], priority = Priority.LOW, ack }) {

        // return an array of promises per unique device (if we want to "broadcast" a message to multiple devices)
        let _publishPromises = _.map(devices, (device) => {
            let _commandData = this._buildCommandData(device, CommandType.LAND);
            return this._publish(_commandData);
        });

        return Promise.all(_publishPromises);

    }
}