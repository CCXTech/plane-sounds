const altitudeCalculator = require('./lib/altitudeCalculator');
const emmiter = require('events');

const altitude = new altitudeCalculator();


async function start() {
    altitude.on('AGLAltitude', (AGLAltitude) => {
        console.log('Got AGL Alt')
        console.log(AGLAltitude);
    })
    await altitude.init();
}

start();