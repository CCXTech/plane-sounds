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
            const data = IMU.getValueSync();
            await this.sleep(1000);
            await this.processData(data);
        }

    }
    async sleep(ms) {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, ms)
        })
    }

    async processData(data){
        console.log('Altitude: ' + this.getAltitude(data));


    }

    getAltitude(data) {
        const p0 = 101325.0; // Pressure at sea level (Pa)
        const g = 9.80665; // Gravitational constant (m/s^2)
        const M = 0.0289644; // Molar mass of Earth's air (kg/mol)
        const T0 = 288.15; // Standard temperature (K) at sea level (15C)
        const R = 8.31447; // Universal gas constant (J/mol*K)

        return -(R * T0 / (g * M)) * Math.log((data.pressure * 100) / p0);
    }

}

module.exports = senseHatAPI;