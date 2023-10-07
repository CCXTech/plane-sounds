const altitudeCalculator = require('./lib/altitudeCalculator');
const senseHatAPI = require('./lib/senseHatAPI');
const emmiter = require('events');

const altitude = new altitudeCalculator();
const senseHat = new senseHatAPI();


async function start() {
    altitude.on('AGLAltitude', (AGLAltitude) => {
        console.log('Got AGL Alt')
        console.log(AGLAltitude);
    })
    //await altitude.init();
    await senseHat.init();
}

start();