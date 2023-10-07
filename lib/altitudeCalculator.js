const emmiter = require('events');
const GPS = require('gps');
const { SerialPort } = require('serialport');

class altitudeCalculator {
    constructor() {
    }

    async init() {
        await this.gpsDataReceiver();
        const { ETOPO1 } = await import('global-elevation');
        this.etopo1 = new ETOPO1();

    }

    async gpsDataReceiver() {
        const port = new SerialPort({
            path: '/dev/ttyUSB0',
            baudRate: 9600,
        })
        const gps = new GPS;
        gps.on('data', async data => {
            if (data.type === 'GGA') {
                await this.AGLEmmiter(data);
            }
        });
        port.on('data', data => {
            gps.updatePartial(data);
        })
    }
    async AGLEmmiter(data) {
        const lat = data.lat;
        const lon = data.lon;
        const elevation = await this.etopo1.getElevation(lon, lat);
        const MSLAltitude = data.altitude;
        const AGLAltitude = MSLAltitude - elevation;
        const AGLAltitudeInFeet = AGLAltitude * 3.28084;

        console.log(AGLAltitudeInFeet);

    }

}

module.exports = altitudeCalculator;

