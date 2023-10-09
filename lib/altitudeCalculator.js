const Emmiter = require('events');
const GPS = require('gps');
const { SerialPort } = require('serialport');

class altitudeCalculator extends Emmiter {
    constructor() {
        super();
    }

    async init() {
        await this.gpsDataReceiver();
        const { ETOPO5 } = await import('global-elevation');
        this.etopo5 = new ETOPO5();

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
                await this.SatelliteEmmiter(data);
            }
        });
        port.on('data', data => {
            gps.updatePartial(data);
        })
    }
    async AGLEmmiter(data) {
        const lat = data.lat;
        const lon = data.lon;
        const elevation = await this.etopo5.getElevation(lon, lat);
        const MSLAltitude = data.alt;
        const AGLAltitude = MSLAltitude - elevation;
        const AGLAltitudeInFeet = AGLAltitude * 3.28084;

        const numSats = data.satellites;

        //console.log('lat: ' + lat);
        //console.log('lon: ' + lon);
        //console.log('Time: ' + data.time);
        //console.log('numSats: ' + numSats);
        //console.log('elevation: ' + elevation);
        //console.log('GPS ALT: ' + MSLAltitude);
        this.emit('AGLAltitude', AGLAltitudeInFeet);

    }
    async SatelliteEmmiter(data) {
        const numSats = data.satellites;
        this.emit('numSats', numSats);
    }

}

module.exports = altitudeCalculator;

