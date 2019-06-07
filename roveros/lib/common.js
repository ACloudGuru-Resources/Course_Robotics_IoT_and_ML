let exec = require('child_process').exec;

module.exports.getSerial = function getSerial(callback) {
    exec('cat /proc/cpuinfo | grep Serial',(error,stdout,stderr) => {
        if(error) return callback(error, null);
        const serialNo = stdout.split(':')[1].trim();
        return callback(null, serialNo);
    });
}

