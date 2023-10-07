const emmiter = require('events');
const GPS = require('gps');
const { SerialPort } = require('serialport');

class altitudeCalculator {
    constructor() {
    }

    async init() {
        await this.gpsDataReceiver();

    }

    async gpsDataReceiver() {
        const port = new SerialPort({
            path: '/dev/ttyUSB0',
            baudRate: 57600,
        })
        const gps = new GPS;
        gps.on('data', async data => {
            console.log(data, gps.state);
        });
        port.on('data', data => {
            gps.updatePartial(data);
        })
    }

}

module.exports = altitudeCalculator;

