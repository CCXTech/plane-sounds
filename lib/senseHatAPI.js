const util = require('util');
const os = require('os');
const Emmiter = require('events');
const nodeimu = require(`${os.homedir()}/nodeimu/index.js`);
const IMU = new nodeimu.IMU();

class senseHatAPI extends Emmiter {
    constructor() {
        super();
    }

    async init() {
        while (true) {
            IMU.getValue((err, data) => {
                if (err) throw err;
                console.log(data);
            });
        }

    }
}

module.exports = senseHatAPI;