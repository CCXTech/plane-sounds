const exec = require('child_process').exec;
const altitudeCalculator = require('./altitudeCalculator');
const senseHatAPI = require('./senseHatAPI');

class annunciator{
    constructor() {
        this.verticalSpeed = 0;
        this.AGLAltitude = 0;
    }
    async init() {
        const altitude = new altitudeCalculator();
        const senseHat = new senseHatAPI();

        altitude.on('AGLAltitude', (AGLAltitude) => {
            this.AGLAltitude = AGLAltitude;
        })
        senseHat.on('verticalSpeed', (verticalSpeed) => {
            this.verticalSpeed = verticalSpeed;
        })
        await altitude.init();
        await senseHat.init();

    }

}

module.exports = annunciator;