const util = require('util');
const Emmiter = require('events');
const nodeimu = require('$HOME/nodeimu/index.js');
const IMU = new nodeimu.IMU();

class senseHatAPI extends Emmiter {
    constructor() {
        super();
    }

    async init() {
        IMU.getValue((err, data) => {
            if (err) throw err;
            console.log(data);
        });

    }
}

module.exports = senseHatAPI;