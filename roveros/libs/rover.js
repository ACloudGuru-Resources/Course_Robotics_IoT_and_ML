const { EasyGopigo3 } = require('node-gopigp3');
const _ = require('lodash');
const PiCamera = require('pi-camera');

class Rover {

    static COMMANDS = ['forward', 'backward', 'stop', 'left', 'right', 'drive_cm', 'drive_degrees', 'left_eye', 'right_eye', 'set_speed', 'image', 'bulk'];

    constructor() {
        this.gpg = new EasyGopigo3();
        this.distanceSensor = this.gpg.initDistanceSensor();
        this.camera = new PiCamera({
            mode: 'photo',
            width: 640,
            height: 480,
            nopreview: true,
            output: `${__dirname}/images/captured.jpg`
        });
    }

    getRoverInstance() {
        return this.gpg;
    }

    kill() {
        this.gpg.stop();
        this.gpg.resetAll();
    }

    getAllTelemetry() {

        let volt = this.gpg.volt();
        let speed = this.gpg.getSpeed();
        let distance = this.distanceSensor.read();

        return {
            voltage: volt,
            speed: speed,
            distance: distance
        }
    }

    execute(command) {
        if (!_.has(COMMANDS, command.type)) return;

        switch (command.type) {
            case 'forward':
                let delay = parseInt(command[command.type].delay);
                this.gpg.forward();
                if (delay > 0) setTimeout(() => this.gpg.stop(), delay);
                break;

            case 'backward':
                let delay = parseInt(command[command.type].delay);
                this.gpg.backward();
                if (delay > 0) setTimeout(() => this.gpg.stop(), delay);
                break;

            case 'stop': this.gpg.stop(); break;

            case 'left':
                let delay = parseInt(command[command.type].delay);
                this.gpg.left();
                if (delay > 0) setTimeout(() => this.gpg.stop(), delay);
                break;

            case 'right':
                let delay = parseInt(command[command.type].delay);
                this.gpg.right();
                if (delay > 0) setTimeout(() => this.gpg.stop(), delay);
                break;

            case 'drive_cm':
                let distance = parseInt(command[command.type].distance);
                this.gpg.driveCm(distance);
                break;

            case 'drive_degrees':
                let distance = parseInt(command[command.type].distance);
                this.gpg.driveDegrees(distance);
                break;

            case 'left_eye': break;
            case 'right_eye': break;
            case 'set_speed':
                let speed = parseInt(command[command.type].speed);
                this.gpg.setSpeed(speed);
                break;

            case 'image': 
                this.camera.snap()
                    .then((result) => {
                        // TODO: Transfer to S3 Bucket
                        console.log('image captured');
                    })
                    .catch((err) => console.log(err));
                break;
                
            case 'bulk': break;
            default: break;
        }
    }
}

module.exports = Rover;