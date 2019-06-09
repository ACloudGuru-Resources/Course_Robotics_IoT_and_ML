let exec = require('child_process').exec;

function getSerial(){
    return new Promise((resolve, reject) => {
        exec('cat /proc/cpuinfo | grep Serial', (err, stdout) => {
            if(err) return reject(new Error(err));
            const serialNo = stdout.split(':')[1].trim();
            return resolve(serialNo);
        })
    })
}

module.exports = {
    getSerial
}


