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
            console.log(IMU.getValueSync())
            await this.sleep(1000);
        }

    }
    async sleep(ms) {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, ms)
        })
    }
}

module.exports = senseHatAPI;