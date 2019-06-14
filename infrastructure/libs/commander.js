let { Iot, IotData } = require('aws-sdk');
let _ = require('lodash');
let { v4 } = require('uuid');

// Priority
const Priority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

const CommandType = {
    FORWARD: 'forward',
    BACKWARD: 'backward',
    STOP: 'stop',
    LEFT: 'left',
    RIGHT: 'right',
    DRIVE_CM: 'drive_cm',
    DRIVE_DEGREES: 'drive_degrees',
    LEFT_EYE: 'left_eye',
    RIGHT_EYE: 'right_eye',
    WAYPOINTS: 'waypoints',
    SET_SPEED: 'set_speed',
    IMAGE: 'image',
    BULK: 'bulk',
    ROTATE: 'rotate'
};

const VERSION = '1.0';
const QOS = 0;


class Commander {
    constructor({ region = 'ap-southeast-2', topicPrefix = 'roborover/control' }) {

        this.region = region;
        this.topicPrefix = topicPrefix;
        this.endpoint = undefined;
        this.iotData = undefined;

        const iot = new Iot({ region: region });

        iot.describeEndpoint({}, (err, data) => {
            if(err) 
                throw new Error(err);

            this.endpoint = data.endpointAddress;
            this.iotData = new IotData({ endpoint: data.endpointAddress });
        });
    }

    _buildCommandTopic(command) {
        return [this.topicPrefix, command].join('/');
    }

    _buildBase({ priority, topic, type, data }) {

        let outerPayload = {}
        outerPayload['topic'] = topic;
        outerPayload['qos'] = QOS;

        let innerPayload = {}
        innerPayload['commandId'] = v4();
        innerPayload['version'] = VERSION;
        innerPayload['timestamp'] = Date.now();
        innerPayload['priority'] = priority;
        innerPayload['type'] = type;
        innerPayload[type] = data;

        outerPayload['payload'] = JSON.stringify(innerPayload);

        console.log(outerPayload);

        return outerPayload;
    }

    _buildCommandData(commandData, commandType, priority = Priority.LOW) {

        const commandTopic = this._buildCommandTopic(commandType);
        const data = this._buildBase({
            priority: priority,
            topic: commandTopic,
            type: commandType,
            data: commandData
        });

        return data;
    }

    _publish(data) {
        return new Promise((resolve, reject) => {
            this.iotData.publish(data, (err) => {
                if (err) return reject(err);
                return resolve(
                    JSON.parse(data.payload));
            });
        })
    }

    _buildSetSpeed(speed) {
        let commandData = { speed: speed };
        let commandPayload = this._buildCommandData(commandData, CommandType.SET_SPEED);
        return commandPayload;
    }

    _buildForward(delay = 0) {
        let commandData = { delay: delay };
        let commandPayload = this._buildCommandData(commandData, CommandType.FORWARD);
        return commandPayload;
    }

    _buildBackward(delay = 0) {
        let commandData = { delay: delay };
        let commandPayload = this._buildCommandData(commandData, CommandType.BACKWARD);
        return commandPayload
    }

    _buildRight(delay = 0) {
        let commandData = { delay: delay };
        let commandPayload = this._buildCommandData(commandData, CommandType.RIGHT);
        return commandPayload;
    }

    _buildLeft(delay = 0) {
        let commandData = { delay: delay };
        let commandPayload = this._buildCommandData(commandData, CommandType.LEFT);
        return commandPayload;
    }

    _buildStop() {
        let commandData = {};
        let commandPayload = this._buildCommandData(commandData, CommandType.STOP);
        return commandPayload;
    }

    _buildDrive(distance = 50) {
        let commandData = { distance: distance };
        let commandPayload = this._buildCommandData(commandData, CommandType.DRIVE_CM);
        return commandPayload;      
    }

    _buildDriveDegrees(degrees = 360) {
        let commandData = { degrees: degrees };
        let commandPayload = this._buildCommandData(commandData, CommandType.DRIVE_DEGREES);
        return commandPayload;          
    }

    _buildBulkCommands(commands) {
        let commandData = commands;
        let commandPayload = this._buildCommandData(commandData, CommandType.BULK);
        return commandPayload;
    }

    _buildImage() {
        let commandData = {};
        let commandPayload = this._buildCommandData(commandData, CommandType.IMAGE);
        return commandPayload;
    }

    _buildRotate(rotation = 90) {
        let commandData = { rotation: rotation };
        let commandPayload = this._buildCommandData(commandData, CommandType.ROTATE)
        return commandPayload;
    }

    isInitialized(withError = false) {
        const isInitialized = this.endpoint !== undefined;

        if(withError && !isInitialized)
            throw 'Commander not initialized';

        return isInitialized;
    }

    setSpeed(speed) {
        this.isInitialized(true);
        return this._publish(this._buildSetSpeed(speed));
    }

    forward(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildForward(delay));
    }

    backward(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildBackward(delay));
    }

    right(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildRight(delay));
    }

    left(delay = 0) {
        this.isInitialized(true);
        return this._publish(this._buildLeft(delay));
    }

    stop() {
        this.isInitialized(true);
        return this._publish(this._buildStop());
    }

    drive(distance = 50) {
        this.isInitialized(true);
        return this._publish(this._buildDrive(distance));        
    }

    driveDegrees(degrees = 360) {
        this.isInitialized(true);
        return this._publish(this._buildDriveDegrees(degrees));           
    }

    rotate(rotation = 90) {
        this.isInitialized(true);
        return this._publish(this._buildRotate(rotation));
    }

    bulkCommands(commands) {
        this.isInitialized(true);
        return this._publish(this._buildBulkCommands(commands));
    }
    image() {
        this.isInitialized(true);
        return this._publish(this._buildImage());
    }

    execute(data) {
        if(typeof this[data.type] != 'function' || data.type.toLowerCase() == 'execute')
            throw `Command ${data.type} doesn't exist.`

        let values = _.values(data.attributes);

        return this[data.type].call(this, ...values);
    }

}

module.exports = Commander;