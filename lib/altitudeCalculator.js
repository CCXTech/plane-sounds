const Emmiter = require('events');
const GPS = require('gps');
const { SerialPort } = require('serialport');

class altitudeCalculator extends Emmiter {
    constructor() {
        super();
        this.offset = 0;
    }

    async init() {
        await this.gpsDataReceiver();
        const { ETOPO5 } = await import('global-elevation');
        this.etopo5 = new ETOPO5();

    }

    setOffset(offset) {
        this.offset = offset;
    }

    async gpsDataReceiver() {
        const port = new SerialPort({
            path: '/dev/ttyUSB0',
            baudRate: 9600,
        })
        const gps = new GPS;
        gps.on('data', async data => {
            if (data.type === 'GGA') {
                await this.GPSEmmiter(data);
            }
        });
        port.on('data', data => {
            gps.updatePartial(data);
        })
    }
    async GPSEmmiter(data) {
        const lat = data.lat;
        const lon = data.lon;
        const elevation = (await this.etopo5.getElevation(lon, lat)) * 3.28084;
        const MSLAltitude = (data.alt) * 3.28084
        const AGLAltitude = (MSLAltitude - elevation);
        const adjustedAGLAltitude = AGLAltitude + this.offset;
        const fix = data.fix;
        const HDOP = data.HDOP;
        const VDOP = data.VDOP;
        const time = data.time;
        const numSats = data.satellites;
        const type = 'gpsData'

        const datatoSend = {
            lat,
            lon,
            elevation,
            MSLAltitude,
            AGLAltitude,
            adjustedAGLAltitude,
            fix,
            HDOP,
            VDOP,
            time,
            numSats,
            type
        }

        //console.log('lat: ' + lat);
        //console.log('lon: ' + lon);
        //console.log('Time: ' + data.time);
        //console.log('numSats: ' + numSats);
        //console.log('elevation: ' + elevation);
        //console.log('GPS ALT: ' + MSLAltitude);
        this.emit('altData', datatoSend );

    }

}

module.exports = altitudeCalculator;

