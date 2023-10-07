const emmiter = require('events');
const GPS = require('gps');
const serialport = require('serialport');

class altitudeCalculator {
    constructor() {
    }

    async init() {
        await this.gpsDataReceiver();

    }

    async gpsDataReceiver() {
        const port = new serialport('/dev/ttyUSB0', {
            baudRate: 9600,
            parser: new serialport.parsers.Readline({
                delimiter: '\r\n'
            })
        });
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

